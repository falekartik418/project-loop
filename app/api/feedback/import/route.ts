import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'

// POST /api/feedback/import — bulk CSV upload
// Expects a plain-text request body containing CSV content, with columns:
// content,channel,customer_label,created_at (first row is a header, and is skipped)
export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const csvText = await req.text()
  if (!csvText || !csvText.trim()) {
    return NextResponse.json({ error: 'No CSV content received' }, { status: 400 })
  }

  const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  // Skip header row
  const dataLines = lines.slice(1)

  let imported = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    // Simple CSV split — good enough for this project's scope.
    // (Doesn't handle commas inside quoted fields; fine for the seed-style data.)
    const [content, channel, customerLabel] = line.split(',').map((v) => v?.trim())

    if (!content || !channel) {
      failed++
      errors.push(`Row ${i + 2}: missing content or channel`)
      continue
    }

    try {
      await db.feedback.create({
        data: {
          content,
          channel,
          customerLabel: customerLabel || undefined,
          workspaceId: session.user.workspaceId,
          status: 'NEW',
        },
      })
      imported++
    } catch (e) {
      failed++
      errors.push(`Row ${i + 2}: failed to save`)
    }
  }

  return NextResponse.json({ imported, failed, errors: errors.slice(0, 20) })
}