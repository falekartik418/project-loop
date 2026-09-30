import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'

const patchSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'ACTIONED']),
})

// PATCH /api/feedback/[id] — update a feedback item's status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.feedback.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  const updated = await db.feedback.update({
    where: { id },
    data: { status: parsed.data.status },
  })

  return NextResponse.json({ feedback: updated })
}

// DELETE /api/feedback/[id] — permanently remove a feedback item
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const { id } = await params

  const existing = await db.feedback.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  // Clean up related rows first (theme links, embedding) before the feedback itself.
  await db.feedbackTheme.deleteMany({ where: { feedbackId: id } })
  await db.embedding.deleteMany({ where: { feedbackId: id } })
  await db.feedback.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}