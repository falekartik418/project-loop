import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'
import { classifyFeedback, embedText } from '@/lib/ai'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const { id } = await params

  const feedback = await db.feedback.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  })
  if (!feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  const existingThemes = await db.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, name: true },
  })

  let result
  try {
    result = await classifyFeedback(
      feedback.content,
      existingThemes.map((t) => t.name),
    )
  } catch (err) {
    console.error('Classification failed for feedback', feedback.id, err)
    return NextResponse.json({ error: 'Classification failed, try again' }, { status: 502 })
  }

  const themeRecords = await Promise.all(
    result.themes.map(async (name) => {
      const existing = existingThemes.find((t) => t.name.toLowerCase() === name.toLowerCase())
      if (existing) return existing
      return db.theme.create({ data: { name, workspaceId: session.user.workspaceId } })
    }),
  )

  const updated = await db.$transaction(async (tx) => {
    await tx.feedbackTheme.deleteMany({ where: { feedbackId: feedback.id } })
    await Promise.all(
      themeRecords.map((theme) =>
        tx.feedbackTheme.create({
          data: { feedbackId: feedback.id, themeId: theme.id, confidence: 0.8 },
        }),
      ),
    )
    return tx.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: result.sentiment,
        sentimentScore: result.sentimentScore,
      },
    })
  })

  // Also generate + store the embedding, so Ask LOOP can find this item later.
  try {
    const vector = await embedText(feedback.content)
    await db.embedding.upsert({
      where: { feedbackId: feedback.id },
      create: { feedbackId: feedback.id, vector },
      update: { vector },
    })
  } catch (err) {
    console.error('Embedding generation failed for feedback', feedback.id, err)
  }

  return NextResponse.json({ feedback: updated, themes: themeRecords, rationale: result.rationale })
}