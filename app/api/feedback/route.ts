import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole, requireSession } from '@/lib/guard'

// GET /api/feedback — list feedback for the caller's workspace, paginated
export async function GET(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    db.feedback.findMany({
      where: { workspaceId: session.user.workspaceId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.feedback.count({
      where: { workspaceId: session.user.workspaceId },
    }),
  ])

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  })
}

// POST /api/feedback — create a single feedback item (Admin + Analyst only)
const createSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  channel: z.string().min(1, 'Channel is required'),
  sourceRef: z.string().optional(),
  customerLabel: z.string().optional(),
})

export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  }

  const feedback = await db.feedback.create({
    data: {
      ...parsed.data,
      workspaceId: session.user.workspaceId,
      status: 'NEW',
    },
  })

  return NextResponse.json({ feedback }, { status: 201 })
}