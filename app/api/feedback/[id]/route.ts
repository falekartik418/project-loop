import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'

const patchSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'ACTIONED']),
})

// PATCH /api/feedback/[id] — update a feedback item's status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Confirm the item belongs to this workspace before touching it —
  // same tenant-isolation check pattern as everywhere else.
  const existing = await db.feedback.findFirst({
    where: { id: params.id, workspaceId: session.user.workspaceId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  const updated = await db.feedback.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  })

  return NextResponse.json({ feedback: updated })
}