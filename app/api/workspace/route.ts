import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole, requireSession } from '@/lib/guard'

export async function GET() {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const workspace = await db.workspace.findUnique({
    where: { id: session.user.workspaceId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { users: true, feedback: true } },
    },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  return NextResponse.json({ workspace })
}

const renameSchema = z.object({
  name: z.string().min(1).max(120),
})

export async function PATCH(req: Request) {
  const auth = await requireRole(['ADMIN'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = renameSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const updated = await db.workspace.update({
    where: { id: session.user.workspaceId },
    data: { name: parsed.data.name },
    select: { id: true, name: true, createdAt: true },
  })

  return NextResponse.json({ workspace: updated })
}