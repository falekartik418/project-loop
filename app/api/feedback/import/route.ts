import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'
import { classifyFeedback, embedText } from '@/lib/ai'

// POST /api/feedback/import — bulk CSV upload
// Expects a plain-text request body containing CSV content, with columns:
// content,channel,customer_label,created_at (first row is a header, and is skipped)
export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const csvText = await req.text()
  if (!csvText || !csvText.trim()) {
    return NextResponse.json({ error: 'No CSV content received' }, { status: 400 })
  }

  const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  const dataLines = lines.slice(1)

  let existingThemes = await db.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, name: true },
  })

  let imported = 0
  let failed = 0
  let classified = 0
  const errors: string[] = []

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    const [content, channel, customerLabel] = line.split(',').map((v) => v?.trim())

    if (!content || !channel) {
      failed++
      errors.push(`Row ${i + 2}: missing content or channel`)
      continue
    }

    let feedback
    try {
      feedback = await db.feedback.create({
        data: {
          content,
          channel,
          customerLabel: customerLabel || undefined,
          workspaceId: session.user.workspaceId,
          status: 'NEW',
        },
      })
      imported++
    } catch (e) {
      failed++
      errors.push(`Row ${i + 2}: failed to save`)
      continue
    }

    // Classify immediately, same pattern as the manual re-classify route.
    // If this fails, the row stays imported but UNCLASSIFIED — recoverable
    // later via manual re-classify, rather than failing the whole import.
    try {
      const result = await classifyFeedback(
        content,
        existingThemes.map((t) => t.name),
      )

      const themeRecords = await Promise.all(
        result.themes.map(async (name) => {
          const existing = existingThemes.find((t) => t.name.toLowerCase() === name.toLowerCase())
          if (existing) return existing
          const created = await db.theme.create({ data: { name, workspaceId: session.user.workspaceId } })
          existingThemes.push(created)
          return created
        }),
      )

      await db.$transaction(async (tx) => {
        await Promise.all(
          themeRecords.map((theme) =>
            tx.feedbackTheme.create({
              data: { feedbackId: feedback.id, themeId: theme.id, confidence: 0.8 },
            }),
          ),
        )
        await tx.feedback.update({
          where: { id: feedback.id },
          data: {
            sentiment: result.sentiment,
            sentimentScore: result.sentimentScore,
            featureArea: result.featureArea,
          },
        })
      })

      classified++

      // Also generate the embedding, so Ask LOOP can find this item later.
      try {
        const vector = await embedText(content)
        await db.embedding.upsert({
          where: { feedbackId: feedback.id },
          create: { feedbackId: feedback.id, vector },
          update: { vector },
        })
      } catch (embedError) {
        console.error(`Embedding failed for row ${i + 2}:`, embedError)
      }
    } catch (classifyError) {
      console.error(`Classification failed for row ${i + 2}:`, classifyError)
    }
  }

  return NextResponse.json({ imported, failed, classified, errors: errors.slice(0, 20) })
}