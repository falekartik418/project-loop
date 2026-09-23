import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireSession } from '@/lib/guard'
import { embedText, cosineSimilarity, answerFromFeedback } from '@/lib/ai'

const askSchema = z.object({
  question: z.string().min(1, 'Question is required'),
})

const TOP_K = 8

export async function POST(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = askSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'A question is required' }, { status: 400 })
  }

  const embedded = await db.embedding.findMany({
    where: { feedback: { workspaceId: session.user.workspaceId } },
    include: { feedback: true },
  })

  if (embedded.length === 0) {
    return NextResponse.json({
      answer: 'No feedback has been classified/embedded yet — run classification on some items first.',
      usedFeedback: [],
    })
  }

  let questionVector: number[]
  try {
    questionVector = await embedText(parsed.data.question)
  } catch (err) {
    console.error('Failed to embed question', err)
    return NextResponse.json({ error: 'Failed to process question' }, { status: 502 })
  }

  const ranked = embedded
    .map((e) => ({
      feedback: e.feedback,
      similarity: cosineSimilarity(questionVector, e.vector),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, TOP_K)

  let result
  try {
    result = await answerFromFeedback(
      parsed.data.question,
      ranked.map((r) => ({ id: r.feedback.id, content: r.feedback.content })),
    )
  } catch (err) {
    console.error('Ask LOOP answer generation failed', err)
    return NextResponse.json({ error: 'Failed to generate an answer' }, { status: 502 })
  }

  const usedFeedback = ranked
    .filter((r) => result.usedFeedbackIds.includes(r.feedback.id))
    .map((r) => ({
      id: r.feedback.id,
      content: r.feedback.content,
      channel: r.feedback.channel,
      similarity: Math.round(r.similarity * 100) / 100,
    }))

  return NextResponse.json({ answer: result.answer, usedFeedback })
}