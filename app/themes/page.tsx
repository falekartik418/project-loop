'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, Input, Modal, Popconfirm, Tag, message } from 'antd'
import { Topbar } from '@/components/Topbar'
import { useReadOnly } from '@/components/useReadOnly'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
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

interface ThemeDetail {
  theme: { id: string; name: string; description: string | null; color: string | null }
  total: number
  sentimentBreakdown: { POS: number; NEU: number; NEG: number }
  series: Array<{ date: string; count: number }>
  recent: Array<{ id: string; content: string; sentiment: string | null; channel: string; createdAt: string }>
}

const SENTIMENT_COLORS = { POS: '#09b983', NEU: '#9eafc6', NEG: '#ff535b' }

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

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<ThemeDetail | null>(null)

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

  const openDetail = async (id: string) => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetail(null)
    const res = await fetch(`/api/themes/${id}/stats`)
    const data = await res.json()
    setDetail(data)
    setDetailLoading(false)
  }

  if (status === 'loading' || loading) {
    return <div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>
  }

  const themeColor = detail?.theme.color ?? '#645df1'

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
              {themes.map((t) => {
                const c = t.color ?? '#645df1'
                return (
                  <div
                    key={t.id}
                    onClick={() => openDetail(t.id)}
                    className="theme-card"
                    style={{ borderTop: `4px solid ${c}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span className="theme-card-icon" style={{ background: `${c}20`, color: c }}>
                          {t.name.slice(0, 1).toUpperCase()}
                        </span>
                        <strong className="theme-card-name">{t.name}</strong>
                      </div>
                      <span onClick={(e) => e.stopPropagation()}>
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
                            className="theme-card-delete"
                          />
                        </Popconfirm>
                      </span>
                    </div>

                    <div className="theme-card-desc">{t.description || 'No description yet'}</div>

                                       <div className="theme-card-footer">
                      <span className="theme-card-count" style={{ background: `${c}18`, color: c }}>
                        {t.count} {t.count === 1 ? 'item' : 'items'}
                      </span>
                      <span className="theme-card-cta" style={{ color: c }}>
                        View details →
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

            <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={680}
        title={
          detail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: `${themeColor}22`,
                  color: themeColor,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {detail.theme.name.slice(0, 1).toUpperCase()}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{detail.theme.name}</span>
            </div>
          ) : (
            'Loading...'
          )
        }
      >
        {detailLoading || !detail ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        ) : (
          <div>
            {detail.theme.description && (
              <p style={{ color: '#647793', marginTop: -6, marginBottom: 18 }}>{detail.theme.description}</p>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: '#f8f9fc', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#7790b3', letterSpacing: 0.4 }}>TOTAL MENTIONS</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#11152d', marginTop: 4 }}>{detail.total}</div>
              </div>
              <div style={{ flex: 1, background: '#f8f9fc', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#7790b3', letterSpacing: 0.4 }}>POSITIVE</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#09b983', marginTop: 4 }}>
                  {detail.total ? Math.round((detail.sentimentBreakdown.POS / detail.total) * 100) : 0}%
                </div>
              </div>
              <div style={{ flex: 1, background: '#f8f9fc', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#7790b3', letterSpacing: 0.4 }}>NEGATIVE</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#ff535b', marginTop: 4 }}>
                  {detail.total ? Math.round((detail.sentimentBreakdown.NEG / detail.total) * 100) : 0}%
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374862' }}>
                  Mentions — last 30 days
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={detail.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColor} stopOpacity={0.45} />
                        <stop offset="95%" stopColor={themeColor} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={6} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={24} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                      labelFormatter={(d) => `Date: ${d}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={themeColor}
                      strokeWidth={2.5}
                      fill="url(#themeGradient)"
                      animationDuration={700}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374862' }}>Sentiment</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: detail.sentimentBreakdown.POS },
                        { name: 'Neutral', value: detail.sentimentBreakdown.NEU },
                        { name: 'Negative', value: detail.sentimentBreakdown.NEG },
                      ]}
                      innerRadius={38}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={700}
                    >
                      <Cell fill={SENTIMENT_COLORS.POS} />
                      <Cell fill={SENTIMENT_COLORS.NEU} />
                      <Cell fill={SENTIMENT_COLORS.NEG} />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: 11, color: '#647793', marginTop: -6 }}>
                  <span><span style={{ color: SENTIMENT_COLORS.POS }}>●</span> Pos</span>
                  <span><span style={{ color: SENTIMENT_COLORS.NEU }}>●</span> Neu</span>
                  <span><span style={{ color: SENTIMENT_COLORS.NEG }}>●</span> Neg</span>
                </div>
              </div>
            </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374862' }}>Recent feedback</div>
              <div style={{ flex: 1, height: 1, background: '#edf0f4' }} />
              <div style={{ fontSize: 11, color: '#9aa6bd' }}>{detail.recent.length} shown</div>
            </div>
            <div style={{ display: 'grid', gap: 10, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
              {detail.recent.length === 0 ? (
                <div style={{ color: '#8ba0bd', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No feedback tagged with this theme yet.
                </div>
              ) : (
                detail.recent.map((f) => {
                  const accent =
                    f.sentiment === 'NEG' ? '#ff535b' : f.sentiment === 'POS' ? '#09b983' : '#9eafc6'
                  return (
                    <div
                      key={f.id}
                      className="theme-feedback-row"
                      style={{ borderLeft: `3px solid ${accent}` }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: '#203654', lineHeight: 1.5 }}>
                          {f.content.slice(0, 100)}{f.content.length > 100 ? '…' : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <span className="theme-channel-pill">{f.channel}</span>
                          <span style={{ fontSize: 11, color: '#b0bcd1' }}>
                            {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Tag
                        style={{
                          marginTop: 1,
                          border: 'none',
                          fontWeight: 600,
                          fontSize: 10,
                          letterSpacing: 0.3,
                          color: accent,
                          background: `${accent}18`,
                        }}
                      >
                        {f.sentiment ?? 'UNCLASSIFIED'}
                      </Tag>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}