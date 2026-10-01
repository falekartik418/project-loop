import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSession } from '@/lib/guard'

export async function GET() {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const workspaceId = auth.session.user.workspaceId

  const themes = await db.theme.findMany({
    where: { workspaceId },
    include: { _count: { select: { feedback: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    themes: themes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      color: t.color,
      count: t._count.feedback,
    })),
  })
}

export async function POST(req: Request) {
  const auth = await requireSession()
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  if (session.user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Viewers cannot add themes' }, { status: 403 })
  }

  const body = await req.json()
  const name = String(body.name ?? '').trim()
  const description = body.description ? String(body.description).trim() : null
  const color = body.color ? String(body.color) : null

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    const theme = await db.theme.create({
      data: { name, description, color, workspaceId: session.user.workspaceId },
    })
    return NextResponse.json({ theme }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'A theme with this name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not create theme' }, { status: 500 })
  }
}