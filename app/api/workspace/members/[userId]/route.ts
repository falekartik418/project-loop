import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'

const patchSchema = z.object({
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireRole(['ADMIN'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const { userId } = await params

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const target = await db.user.findFirst({
    where: { id: userId, workspaceId: session.user.workspaceId },
  })
  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  if (target.id === session.user.id && parsed.data.role !== 'ADMIN') {
    return NextResponse.json(
      { error: "You can't demote yourself out of Admin" },
      { status: 400 },
    )
  }

  const updated = await db.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ member: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireRole(['ADMIN'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const { userId } = await params

  const target = await db.user.findFirst({
    where: { id: userId, workspaceId: session.user.workspaceId },
  })
  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 })
  }

  await db.user.delete({ where: { id: target.id } })
  return NextResponse.json({ ok: true })
}