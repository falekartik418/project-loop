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
import { Card, Tag, Switch, Button, Modal, Input, message } from 'antd'
import { Topbar } from '@/components/Topbar'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loading, setLoading] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    async function load() {
      setLoading(true)
      const res = await fetch('/api/settings')
      const data = await res.json()
      setEmailNotifications(data.emailNotifications ?? true)
      setLoading(false)
    }
    load()
  }, [status])

  async function toggleNotifications(checked: boolean) {
    setSavingToggle(true)
    setEmailNotifications(checked)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailNotifications: checked }),
    })
    if (!res.ok) {
      setEmailNotifications(!checked)
      message.error('Failed to update preference')
    }
    setSavingToggle(false)
  }

  async function deleteWorkspace() {
    if (confirmText !== 'DELETE') {
      message.error('Type DELETE to confirm')
      return
    }
    setDeleting(true)
    const res = await fetch('/api/settings', { method: 'DELETE' })
    if (res.ok) {
      message.success('Workspace deleted')
      signOut({ callbackUrl: '/login' })
    } else {
      const data = await res.json().catch(() => ({}))
      message.error(data.error ?? 'Failed to delete workspace')
      setDeleting(false)
    }
  }

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
          <Link href="/workspace"><button><DatabaseOutlined /> Workspace</button></Link>
          <Link href="/members"><button><UserOutlined /> Members</button></Link>
          <button className="active"><SettingOutlined /> Settings</button>
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
              <h1>Settings</h1>
              <p>Manage notifications and workspace preferences.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
          ) : (
            <>
              <Card>
                <div className="panel-heading"><h3>Notifications</h3></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 420 }}>
                  <div>
                    <strong>Email notifications</strong>
                    <div style={{ fontSize: 13, color: '#647793' }}>
                      Get notified about new reports and trending issues.
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onChange={toggleNotifications} loading={savingToggle} />
                </div>
              </Card>

              {isAdmin && (
                <Card style={{ marginTop: 20, borderColor: '#ef4444' }}>
                  <div className="panel-heading"><h3 style={{ color: '#ef4444' }}>Danger Zone</h3></div>
                  <p style={{ color: '#647793', fontSize: 13, marginBottom: 12 }}>
                    Deleting the workspace permanently removes all members, feedback, themes, and reports. This cannot be undone.
                  </p>
                  <Button danger onClick={() => setConfirmOpen(true)}>Delete Workspace</Button>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      <Modal
        title="Delete workspace"
        open={confirmOpen}
        onCancel={() => { setConfirmOpen(false); setConfirmText('') }}
        onOk={deleteWorkspace}
        okText="Delete permanently"
        okButtonProps={{ danger: true, loading: deleting }}
      >
        <p>This will permanently delete your workspace and everything in it. Type <strong>DELETE</strong> to confirm.</p>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
      </Modal>
    </div>
  )
}