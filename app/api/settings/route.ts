import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole, requireSession } from '@/lib/guard'

export async function GET() {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailNotifications: true },
  })

  return NextResponse.json({ emailNotifications: user?.emailNotifications ?? true })
}

const patchSchema = z.object({
  emailNotifications: z.boolean(),
})

export async function PATCH(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { emailNotifications: parsed.data.emailNotifications },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const auth = await requireRole(['ADMIN'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  await db.workspace.delete({ where: { id: session.user.workspaceId } })

  return NextResponse.json({ ok: true })
}