import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole, requireSession } from '@/lib/guard'

// GET /api/feedback — list feedback for the caller's workspace, paginated,
// with search + filters. All query params are optional.
//
// Example: /api/feedback?page=1&search=onboarding&channel=Support+ticket&sentiment=NEG&status=NEW
export async function GET(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const search = searchParams.get('search')
  const channel = searchParams.get('channel')
  const sentiment = searchParams.get('sentiment') // POS | NEU | NEG
  const status = searchParams.get('status') // NEW | REVIEWED | ACTIONED
  const themeId = searchParams.get('themeId')
  const dateFrom = searchParams.get('dateFrom') // ISO date string
  const dateTo = searchParams.get('dateTo')

  // Build the where-clause incrementally so filters are all optional.
  const where: any = { workspaceId: session.user.workspaceId }

  if (search) {
    where.content = { contains: search, mode: 'insensitive' }
  }
  if (channel) where.channel = channel
  if (sentiment) where.sentiment = sentiment
  if (status) where.status = status
  if (themeId) where.themes = { some: { themeId } }
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  const [items, total] = await Promise.all([
    db.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        themes: { include: { theme: true } },
      },
    }),
    db.feedback.count({ where }),
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