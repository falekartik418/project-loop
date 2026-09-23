import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole, requireSession } from '@/lib/guard'
import { generateReportNarrative } from '@/lib/ai'

export async function GET() {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const reports = await db.report.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { generatedBy: { select: { name: true } } },
  })

  return NextResponse.json({ reports })
}

const createSchema = z.object({
  periodDays: z.number().min(1).max(365).default(30),
  title: z.string().optional(),
})

export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  const periodDays = parsed.success ? parsed.data.periodDays : 30

  const periodEnd = new Date()
  const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
  const workspaceId = session.user.workspaceId

  const itemsInPeriod = await db.feedback.findMany({
    where: { workspaceId, createdAt: { gte: periodStart, lte: periodEnd } },
    include: { themes: { include: { theme: true } } },
  })

  const sentimentBreakdown = { POS: 0, NEU: 0, NEG: 0 }
  for (const item of itemsInPeriod) {
    if (item.sentiment) sentimentBreakdown[item.sentiment]++
  }

  const themeCounts: Record<string, number> = {}
  for (const item of itemsInPeriod) {
    for (const link of item.themes) {
      themeCounts[link.theme.name] = (themeCounts[link.theme.name] || 0) + 1
    }
  }
  const topThemes = Object.entries(themeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const sampleQuotes = itemsInPeriod
    .filter((i) => i.sentiment === 'NEG')
    .slice(0, 3)
    .map((i) => i.content)
  if (sampleQuotes.length < 3) {
    sampleQuotes.push(...itemsInPeriod.slice(0, 3 - sampleQuotes.length).map((i) => i.content))
  }

  const periodLabel = `${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}`

  let narrative: string
  try {
    narrative = await generateReportNarrative({
      periodLabel,
      totalItems: itemsInPeriod.length,
      sentimentBreakdown,
      topThemes,
      sampleQuotes,
    })
  } catch (err) {
    console.error('Report narrative generation failed', err)
    return NextResponse.json({ error: 'Failed to generate report narrative' }, { status: 502 })
  }

  const report = await db.report.create({
    data: {
      title: (parsed.success && parsed.data.title) || `Voice of Customer — ${periodLabel}`,
      periodStart,
      periodEnd,
      workspaceId,
      generatedById: session.user.id,
      contentJson: {
        narrative,
        stats: { totalItems: itemsInPeriod.length, sentimentBreakdown, topThemes, sampleQuotes },
      },
    },
  })

  return NextResponse.json({ report }, { status: 201 })
}