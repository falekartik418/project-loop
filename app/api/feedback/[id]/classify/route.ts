import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'
import { classifyFeedback } from '@/lib/ai'

// POST /api/feedback/[id]/classify — runs AI classification on one item
// and saves the result. Used both on ingest and for manual re-classify.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const feedback = await db.feedback.findFirst({
    where: { id: params.id, workspaceId: session.user.workspaceId },
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

  // Match returned theme names to existing themes, or create new ones.
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

  return NextResponse.json({ feedback: updated, themes: themeRecords, rationale: result.rationale })
}