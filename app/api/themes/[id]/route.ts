import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSession } from '@/lib/guard'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  if (session.user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Viewers cannot delete themes' }, { status: 403 })
  }

  const { id } = await params
  await db.theme.deleteMany({ where: { id, workspaceId: session.user.workspaceId } })
  return NextResponse.json({ ok: true })
}