'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, Input, Popconfirm, Tag, message } from 'antd'
import { Topbar } from '@/components/Topbar'
import { useReadOnly } from '@/components/useReadOnly'
import {
  BarChartOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LineChartOutlined,
  LogoutOutlined,
  PlusOutlined,
  RadarChartOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'

interface ThemeItem {
  id: string
  name: string
  description: string | null
  color: string | null
  count: number
}

export default function ThemesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [themes, setThemes] = useState<ThemeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#645df1')
  const [saving, setSaving] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const { isViewer, showReadOnly, contextHolder: readOnlyHolder } = useReadOnly()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const load = useCallback(async () => {
    const res = await fetch('/api/themes')
    const data = await res.json()
    setThemes(data.themes ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status, load])

  const addTheme = async () => {
    if (isViewer) {
      showReadOnly()
      return
    }
    if (!name.trim()) return messageApi.warning('Type a theme name first')
    setSaving(true)
    const res = await fetch('/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return messageApi.error(data.error ?? 'Something went wrong')
    messageApi.success(`"${name.trim()}" added`)
    setName('')
    setDescription('')
    load()
  }

  const removeTheme = async (id: string) => {
    if (isViewer) {
      showReadOnly()
      return
    }
    const res = await fetch(`/api/themes/${id}`, { method: 'DELETE' })
    if (!res.ok) return messageApi.error('Could not delete theme')
    messageApi.success('Theme deleted')
    load()
  }

  if (status === 'loading' || loading) {
    return <div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div className="app-shell">
      {contextHolder}
      {readOnlyHolder}
      <aside className="app-sidebar">
        <div className="app-logo">
          <span className="mark" aria-hidden="true">
            <span />
            <span />
          </span>{' '}
          LOOP
        </div>
        <nav className="app-nav">
          <Link href="/dashboard">
            <button>
              <BarChartOutlined /> Overview
            </button>
          </Link>
          <Link href="/feedback">
            <button>
              <FileTextOutlined /> Feedback
            </button>
          </Link>
          <Link href="/trends">
            <button>
              <LineChartOutlined /> Trends
            </button>
          </Link>
          <Link href="/ask">
            <button>
              <RadarChartOutlined /> Ask LOOP <Tag>AI</Tag>
            </button>
          </Link>
          <Link href="/reports">
            <button>
              <FileTextOutlined /> Reports
            </button>
          </Link>
          <Link href="/themes">
            <button className="active">
              <BgColorsOutlined /> Themes
            </button>
          </Link>
        </nav>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="app-nav secondary">
          <button>
            <DatabaseOutlined /> Workspace
          </button>
          <Link href="/members">
            <button>
              <UserOutlined /> Members
            </button>
          </Link>
          <button>
            <SettingOutlined /> Settings
          </button>
        </nav>
        <div className="user-switch">
          <Link
            href="/profile"
            style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
          >
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
              <h1>Themes</h1>
              <p>Categories your feedback is grouped into, like Billing or Customer Service.</p>
            </div>
          </div>

          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>Add a new theme</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                placeholder="Theme name (e.g. Customer Service)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onPressEnter={addTheme}
                style={{ width: 260 }}
              />
              <Input
                placeholder="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: 300 }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="Theme color"
                style={{ width: 44, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <Button type="primary" icon={<PlusOutlined />} loading={saving} onClick={addTheme}>
                Add theme
              </Button>
            </div>
          </Card>

          <h3>All themes ({themes.length})</h3>
          {themes.length === 0 ? (
            <Card>No themes yet. Add your first one above.</Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {themes.map((t) => (
                <Card key={t.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: t.color ?? '#94a6bd',
                        display: 'inline-block',
                      }}
                    />
                    <strong style={{ fontSize: 15 }}>{t.name}</strong>
                    <Popconfirm
                      title="Delete this theme?"
                      description="It will be removed from all feedback."
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      disabled={isViewer}
                      onConfirm={() => removeTheme(t.id)}
                    >
                      <DeleteOutlined
                        onClick={isViewer ? showReadOnly : undefined}
                        style={{ marginLeft: 'auto', cursor: 'pointer', color: '#f2444d' }}
                      />
                    </Popconfirm>
                  </div>
                  <div style={{ fontSize: 13, color: '#647793', minHeight: 20 }}>{t.description || 'No description'}</div>
                  <div style={{ marginTop: 10, fontSize: 12 }}>
                    <b>{t.count}</b> feedback {t.count === 1 ? 'item' : 'items'}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}