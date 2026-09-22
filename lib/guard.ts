import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

type Role = 'ADMIN' | 'ANALYST' | 'VIEWER'

export async function requireRole(allowed: Role[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!allowed.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return { session }
}

export async function requireSession() {
  return requireRole(['ADMIN', 'ANALYST', 'VIEWER'])
}