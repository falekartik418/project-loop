'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogoutOutlined } from '@ant-design/icons'
import {
  BarChartOutlined, BgColorsOutlined, DatabaseOutlined, FileTextOutlined, LineChartOutlined,
  RadarChartOutlined, SettingOutlined, UserOutlined,
} from '@ant-design/icons'
import { Card, Tag, Input, Button, message } from 'antd'
import { Topbar } from '@/components/Topbar'
import { useReadOnly } from '@/components/useReadOnly'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const { isViewer, showReadOnly, contextHolder: readOnlyHolder } = useReadOnly()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    async function load() {
      setLoading(true)
      const res = await fetch('/api/profile')
      const data = await res.json()
      setProfile(data.user)
      setName(data.user?.name ?? '')
      setLoading(false)
    }
    load()
  }, [status])

  async function saveName() {
    if (isViewer) {
      showReadOnly()
      return
    }
    setSavingName(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const data = await res.json()
      setProfile(data.user)
      await update({ name: data.user.name })
      messageApi.success('Name updated')
    } else {
      const data = await res.json().catch(() => ({}))
      messageApi.error(data.error ?? 'Failed to update name')
    }
    setSavingName(false)
  }

  async function savePassword() {
    if (isViewer) {
      showReadOnly()
      return
    }
    if (!currentPassword || !newPassword) {
      messageApi.error('Enter both current and new password')
      return
    }
    setSavingPassword(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (res.ok) {
      messageApi.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
    } else {
      const data = await res.json().catch(() => ({}))
      messageApi.error(data.error ?? 'Failed to update password')
    }
    setSavingPassword(false)
  }

  return (
    <div className="app-shell">
      {contextHolder}
      {readOnlyHolder}
      <aside className="app-sidebar">
        <div className="app-logo"><Mark /> LOOP</div>
        <nav className="app-nav">
          <Link href="/dashboard"><button><BarChartOutlined /> Overview</button></Link>
          <Link href="/feedback"><button><FileTextOutlined /> Feedback</button></Link>
          <Link href="/trends"><button><LineChartOutlined /> Trends</button></Link>
          <Link href="/ask"><button><RadarChartOutlined /> Ask LOOP <Tag>AI</Tag></button></Link>
          <Link href="/reports"><button><FileTextOutlined /> Reports</button></Link>
          <Link href="/themes"><button><BgColorsOutlined /> Themes</button></Link>
        </nav>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="app-nav secondary">
          <Link href="/workspace"><button><DatabaseOutlined /> Workspace</button></Link>
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
              <h1>Profile</h1>
              <p>Manage your account details.</p>
            </div>
          </div>

          {loading || !profile ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
          ) : (
            <>
              <Card>
                <div className="panel-heading"><h3>Account</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
                  <div>
                    <label style={{ fontSize: 13, color: '#647793' }}>Name</label>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                      <Button type="primary" onClick={saveName} loading={savingName}>Save</Button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: '#647793' }}>Email</label>
                    <Input value={profile.email} disabled style={{ marginTop: 4 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: '#647793' }}>Role</label>
                    <div style={{ marginTop: 4 }}><Tag>{profile.role}</Tag></div>
                  </div>
                  <p style={{ color: '#647793', fontSize: 13, marginTop: 8 }}>
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>

              <Card style={{ marginTop: 20 }}>
                <div className="panel-heading"><h3>Change Password</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
                  <Input.Password
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input.Password
                    placeholder="New password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button type="primary" onClick={savePassword} loading={savingPassword} style={{ width: 'fit-content' }}>
                    Update Password
                  </Button>
                </div>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}