import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSession } from '@/lib/guard'

// GET /api/insights — stats for the dashboard: totals, sentiment breakdown,
// volume over time, and top themes. Accepts optional ?days=N (default 30)
// to control the time window.
export async function GET(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const workspaceId = session.user.workspaceId

  const { searchParams } = new URL(req.url)
  const days = Math.max(1, Number(searchParams.get('days')) || 30)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [total, negativeCount, newThisWeek, allInWindow, themeLinks] = await Promise.all([
    db.feedback.count({ where: { workspaceId } }),
    db.feedback.count({ where: { workspaceId, sentiment: 'NEG' } }),
    db.feedback.count({
      where: { workspaceId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    db.feedback.findMany({
      where: { workspaceId, createdAt: { gte: since } },
      select: { createdAt: true, sentiment: true },
    }),
    db.feedbackTheme.findMany({
      where: { feedback: { workspaceId, createdAt: { gte: since } } },
      include: { theme: true },
    }),
  ])

  // Volume over time: bucket by day
  const volumeByDay: Record<string, number> = {}
  for (const item of allInWindow) {
    const day = item.createdAt.toISOString().slice(0, 10)
    volumeByDay[day] = (volumeByDay[day] || 0) + 1
  }
  const volumeOverTime = Object.entries(volumeByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // Sentiment breakdown
  const sentimentBreakdown = { POS: 0, NEU: 0, NEG: 0, unclassified: 0 }
  for (const item of allInWindow) {
    if (item.sentiment) sentimentBreakdown[item.sentiment]++
    else sentimentBreakdown.unclassified++
  }

  // Top themes by count
  const themeCounts: Record<string, { name: string; count: number }> = {}
  for (const link of themeLinks) {
    const key = link.theme.id
    if (!themeCounts[key]) themeCounts[key] = { name: link.theme.name, count: 0 }
    themeCounts[key].count++
  }
  const topThemes = Object.values(themeCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const percentNegative = total > 0 ? Math.round((negativeCount / total) * 100) : 0

  return NextResponse.json({
    statCards: {
      totalItems: total,
      percentNegative,
      newThisWeek,
    },
    volumeOverTime,
    sentimentBreakdown,
    topThemes,
  })
}