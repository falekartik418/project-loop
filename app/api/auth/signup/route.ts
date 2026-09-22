import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'

const signupSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  workspaceName: z.string().min(1).max(120),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { name, email, password, workspaceName } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const result = await db.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: workspaceName },
    })

    const user = await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'ADMIN',
        workspaceId: workspace.id,
      },
    })

    return { workspace, user }
  })

  return NextResponse.json(
    {
      user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
      workspace: { id: result.workspace.id, name: result.workspace.name },
    },
    { status: 201 },
  )
}