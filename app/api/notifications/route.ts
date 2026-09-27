import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notifications = await db.notification.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ notifications })
}

export async function PATCH() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await db.notification.updateMany({
    where: { workspaceId: session.user.workspaceId, read: false },
    data: { read: true },
  })
  return NextResponse.json({ success: true })
}