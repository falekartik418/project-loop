import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole, requireSession } from '@/lib/guard'

export async function GET() {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const members = await db.user.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ members })
}

const inviteSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
})

export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, password, role } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const member = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      workspaceId: session.user.workspaceId,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json({ member }, { status: 201 })
}