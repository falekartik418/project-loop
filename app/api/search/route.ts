import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const workspaceId = session.user.workspaceId
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q) return NextResponse.json({ results: [] })

  const [feedbackMatches, themeMatches] = await Promise.all([
    db.feedback.findMany({
      where: { workspaceId, content: { contains: q, mode: 'insensitive' } },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    db.theme.findMany({
      where: { workspaceId, name: { contains: q, mode: 'insensitive' } },
      take: 4,
    }),
  ])

  const results = [
    ...feedbackMatches.map((f) => ({
      id: f.id,
      type: 'feedback' as const,
      title: f.content.slice(0, 60) + (f.content.length > 60 ? '…' : ''),
      subtitle: `${f.channel} · ${new Date(f.createdAt).toLocaleDateString()}`,
      href: `/feedback?highlight=${f.id}`,
    })),
    ...themeMatches.map((t) => ({
      id: t.id,
      type: 'theme' as const,
      title: t.name,
      subtitle: 'Theme',
      href: `/feedback?theme=${encodeURIComponent(t.name)}`,
    })),
  ]

  return NextResponse.json({ results })
}