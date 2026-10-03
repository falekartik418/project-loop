import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSession } from '@/lib/guard'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const { id } = await params

  const theme = await db.theme.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  })
  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
  }

  const links = await db.feedbackTheme.findMany({
    where: { themeId: id },
    include: { feedback: true },
  })

  const feedbackItems = links
    .map((l) => l.feedback)
    .filter((f) => f.workspaceId === session.user.workspaceId)

  const sentimentBreakdown = { POS: 0, NEU: 0, NEG: 0 }
  for (const f of feedbackItems) {
    if (f.sentiment) sentimentBreakdown[f.sentiment as 'POS' | 'NEU' | 'NEG']++
  }

  // Daily mention counts for the last 30 days
  const days = 30
  const now = new Date()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const dayMap: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const f of feedbackItems) {
    if (f.createdAt >= start) {
      const key = f.createdAt.toISOString().slice(0, 10)
      if (key in dayMap) dayMap[key]++
    }
  }
  const series = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  const recent = feedbackItems
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
    .map((f) => ({
      id: f.id,
      content: f.content,
      sentiment: f.sentiment,
      channel: f.channel,
      createdAt: f.createdAt,
    }))

  return NextResponse.json({
    theme: { id: theme.id, name: theme.name, description: theme.description, color: theme.color },
    total: feedbackItems.length,
    sentimentBreakdown,
    series,
    recent,
  })
}