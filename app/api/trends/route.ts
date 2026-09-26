import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSession } from '@/lib/guard'

export async function GET(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth
  const workspaceId = session.user.workspaceId

  const { searchParams } = new URL(req.url)
  const days = Math.max(1, Number(searchParams.get('days')) || 30)
  const now = Date.now()
  const currentStart = new Date(now - days * 24 * 60 * 60 * 1000)
  const previousStart = new Date(now - days * 2 * 24 * 60 * 60 * 1000)

  const [currentLinks, previousLinks, allThemes] = await Promise.all([
    db.feedbackTheme.findMany({
      where: { feedback: { workspaceId, createdAt: { gte: currentStart } } },
      include: { theme: true, feedback: { select: { sentiment: true } } },
    }),
    db.feedbackTheme.findMany({
      where: {
        feedback: { workspaceId, createdAt: { gte: previousStart, lt: currentStart } },
      },
      include: { theme: true },
    }),
    db.theme.findMany({ where: { workspaceId } }),
  ])

  const countByTheme = (links: typeof previousLinks) => {
    const counts: Record<string, number> = {}
    for (const link of links) {
      counts[link.themeId] = (counts[link.themeId] || 0) + 1
    }
    return counts
  }

  const sentimentByTheme: Record<string, { POS: number; NEU: number; NEG: number }> = {}
  for (const link of currentLinks) {
    if (!sentimentByTheme[link.themeId]) sentimentByTheme[link.themeId] = { POS: 0, NEU: 0, NEG: 0 }
    if (link.feedback.sentiment) sentimentByTheme[link.themeId][link.feedback.sentiment]++
  }

  const currentCounts = countByTheme(currentLinks)
  const previousCounts = countByTheme(previousLinks)

  const trends = allThemes.map((theme) => {
    const current = currentCounts[theme.id] || 0
    const previous = previousCounts[theme.id] || 0
    const changePercent =
      previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100)

    const sentiments = sentimentByTheme[theme.id] ?? { POS: 0, NEU: 0, NEG: 0 }
    let dominantSentiment: 'POS' | 'NEU' | 'NEG' = 'NEU'
    if (sentiments.NEG >= sentiments.POS && sentiments.NEG >= sentiments.NEU && sentiments.NEG > 0) {
      dominantSentiment = 'NEG'
    } else if (sentiments.POS >= sentiments.NEU && sentiments.POS > 0) {
      dominantSentiment = 'POS'
    }

    return {
      themeId: theme.id,
      themeName: theme.name,
      currentCount: current,
      previousCount: previous,
      changePercent,
      isSpiking: changePercent >= 50 && current >= 3,
      dominantSentiment,
    }
  })

  trends.sort((a, b) => b.currentCount - a.currentCount)

  return NextResponse.json({ trends, windowDays: days })
}