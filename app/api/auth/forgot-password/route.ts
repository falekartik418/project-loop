import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { db } from '@/lib/db'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const user = await db.user.findUnique({ where: { email } })

  // Don't reveal whether the email exists — respond the same way either way.
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetLink = `${baseUrl}/reset-password?token=${token}`

  // No email service is configured for this project, so the reset link
  // is returned directly instead of being emailed. In a real production
  // app, this would be sent via an email provider instead of returned here.
  return NextResponse.json({ ok: true, resetLink })
}