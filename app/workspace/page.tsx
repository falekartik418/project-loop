'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogoutOutlined } from '@ant-design/icons'
import {
  BarChartOutlined, DatabaseOutlined, FileTextOutlined, LineChartOutlined,
  RadarChartOutlined, SettingOutlined, UserOutlined,
} from '@ant-design/icons'
import { Card, Tag, Input, Button, message } from 'antd'
import { Topbar } from '@/components/Topbar'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface WorkspaceData {
  id: string
  name: string
  createdAt: string
  _count: { users: number; feedback: number }
}

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    async function load() {
      setLoading(true)
      const res = await fetch('/api/workspace')
      const data = await res.json()
      setWorkspace(data.workspace)
      setName(data.workspace?.name ?? '')
      setLoading(false)
    }
    load()
  }, [status])

  async function saveName() {
    setSaving(true)
    const res = await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const data = await res.json()
      setWorkspace((w) => (w ? { ...w, name: data.workspace.name } : w))
      message.success('Workspace name updated')
    } else {
      message.error('Failed to update workspace name')
    }
    setSaving(false)
  }

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-logo"><Mark /> LOOP</div>
        <nav className="app-nav">
          <Link href="/dashboard"><button><BarChartOutlined /> Overview</button></Link>
          <Link href="/feedback"><button><FileTextOutlined /> Feedback</button></Link>
          <Link href="/trends"><button><LineChartOutlined /> Trends</button></Link>
          <Link href="/ask"><button><RadarChartOutlined /> Ask LOOP <Tag>AI</Tag></button></Link>
          <Link href="/reports"><button><FileTextOutlined /> Reports</button></Link>
        </nav>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="app-nav secondary">
          <button className="active"><DatabaseOutlined /> Workspace</button>
          <Link href="/members"><button><UserOutlined /> Members</button></Link>
          <Link href="/settings"><button><SettingOutlined /> Settings</button></Link>
        </nav>
       <div className="user-switch">
  <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
    <span>{session?.user?.name?.slice(0, 2).toUpperCase()}</span>
    <div>
      <strong>{session?.user?.name}</strong>
      <small>{session?.user?.role}</small>
    </div>
  </Link>
  <LogoutOutlined
    onClick={() => signOut({ callbackUrl: '/login' })}
    style={{ cursor: 'pointer', color: '#647793', fontSize: 16 }}
    title="Log out"
  />
</div>
      </aside>

      <div className="app-main">
        <Topbar />
        <main className="overview-content">
          <div className="overview-heading">
            <div>
              <h1>Workspace</h1>
              <p>Manage your workspace details.</p>
            </div>
          </div>

          {loading || !workspace ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
          ) : (
            <>
              <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <Card>
                  <small>MEMBERS</small>
                  <strong>{workspace._count.users}</strong>
                </Card>
                <Card>
                  <small>TOTAL FEEDBACK</small>
                  <strong>{workspace._count.feedback}</strong>
                </Card>
              </div>

              <Card style={{ marginTop: 20 }}>
                <div className="panel-heading"><h3>Workspace Name</h3></div>
                <div style={{ display: 'flex', gap: 12, maxWidth: 420 }}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isAdmin}
                  />
                  {isAdmin && (
                    <Button type="primary" onClick={saveName} loading={saving}>
                      Save
                    </Button>
                  )}
                </div>
                {!isAdmin && (
                  <p style={{ marginTop: 8, color: '#647793', fontSize: 13 }}>
                    Only admins can rename the workspace.
                  </p>
                )}
                <p style={{ marginTop: 16, color: '#647793', fontSize: 13 }}>
                  Created {new Date(workspace.createdAt).toLocaleDateString()}
                </p>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
