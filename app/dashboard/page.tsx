'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Topbar } from '@/components/Topbar'
import { LogoutOutlined } from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  BarChartOutlined,
  BgColorsOutlined,
  BellOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FilterOutlined,
  LineChartOutlined,
  MoonOutlined,
  RadarChartOutlined,
  SearchOutlined,
  SettingOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Card, Tag } from 'antd'
import { useThemeMode } from '../theme-provider'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface InsightsData {
  statCards: { totalItems: number; percentNegative: number; newThisWeek: number }
  volumeOverTime: Array<{ date: string; total: number; positive: number; negative: number }>
  sentimentBreakdown: { POS: number; NEU: number; NEG: number; unclassified: number }
  topThemes: Array<{ name: string; count: number }>
}

interface Trend {
  themeId: string
  themeName: string
  currentCount: number
  previousCount: number
  changePercent: number
  isSpiking: boolean
  dominantSentiment: 'POS' | 'NEU' | 'NEG'
}

interface FeedbackItem {
  id: string
  content: string
  channel: string
  sentiment: string | null
  status: string
  createdAt: string
  themes: Array<{ theme: { name: string } }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { dark, toggle } = useThemeMode()
  const router = useRouter()
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [trends, setTrends] = useState<Trend[]>([])
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    async function load() {
      setLoading(true)
      const [insightsRes, feedbackRes, trendsRes] = await Promise.all([
        fetch('/api/insights'),
        fetch('/api/feedback?page=1'),
        fetch('/api/trends'),
      ])
      const insightsData = await insightsRes.json()
      const feedbackData = await feedbackRes.json()
      const trendsData = await trendsRes.json()
      setInsights(insightsData)
      setRecentFeedback(feedbackData.items.slice(0, 6))
      setTrends((trendsData.trends ?? []).slice(0, 4))
      setLoading(false)
    }
    load()
  }, [status])

  if (status === 'loading' || loading) {
    return <div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>
  }

  const totalSentiment = insights
    ? insights.sentimentBreakdown.POS + insights.sentimentBreakdown.NEU + insights.sentimentBreakdown.NEG
    : 0

  const volume = insights?.volumeOverTime ?? []

  const posPct = totalSentiment ? Math.round(((insights?.sentimentBreakdown.POS ?? 0) / totalSentiment) * 100) : 0
  const neuPct = totalSentiment ? Math.round(((insights?.sentimentBreakdown.NEU ?? 0) / totalSentiment) * 100) : 0
  const negPct = 100 - posPct - neuPct

  const topSpike = trends.find((t) => t.isSpiking)

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-logo">
          <Mark /> LOOP
        </div>
        <nav className="app-nav">
          <button className="active">
            <BarChartOutlined /> Overview
          </button>
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
            <button>
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
              <h1>Good morning, {session?.user?.name?.split(' ')[0]}.</h1>
              <p>Here&apos;s what your customers are saying.</p>
            </div>
            <div className="overview-actions">
              <Button icon={<FilterOutlined />}>Filters</Button>
            </div>
          </div>

          <div className="kpi-grid">
            <Card>
              <small>
                TOTAL FEEDBACK <FileTextOutlined />
              </small>
              <strong>{insights?.statCards.totalItems ?? 0}</strong>
            </Card>
            <Card>
              <small>NEGATIVE FEEDBACK</small>
              <strong>{insights?.statCards.percentNegative ?? 0}%</strong>
            </Card>
            <Card>
              <small>NEW THIS WEEK</small>
              <strong>{insights?.statCards.newThisWeek ?? 0}</strong>
            </Card>
            <Card>
              <small>
                TOP THEME <TagsOutlined />
              </small>
              <strong className="theme-value">{insights?.topThemes[0]?.name ?? '—'}</strong>
              <span className="positive">{insights?.topThemes[0]?.count ?? 0} mentions</span>
            </Card>
          </div>

          <div className="chart-grid">
            <Card className="volume-card">
              <div className="panel-heading">
                <div>
                  <h3>Feedback Volume</h3>
                  <p>Last {volume.length} days with activity</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={volume} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 11, fill: '#8b9ac2' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#8b9ac2' }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#655cff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="positive" name="Positive" stroke="#09b983" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="negative" name="Negative" stroke="#ff535b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="sentiment-card">
              <div className="panel-heading">
                <div>
                  <h3>Sentiment</h3>
                </div>
              </div>
                            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    <filter id="donutShadow" height="130%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <Pie
                    data={[
                      { name: 'Positive', value: insights?.sentimentBreakdown.POS ?? 0 },
                      { name: 'Neutral', value: insights?.sentimentBreakdown.NEU ?? 0 },
                      { name: 'Negative', value: insights?.sentimentBreakdown.NEG ?? 0 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    cornerRadius={6}
                    style={{ filter: 'url(#donutShadow)' }}
                    label={({ name, percent }) =>
                      percent && percent > 0.06 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    <Cell fill="#09b983" stroke="#fff" strokeWidth={2} />
                    <Cell fill="#9eafc6" stroke="#fff" strokeWidth={2} />
                    <Cell fill="#ff535b" stroke="#fff" strokeWidth={2} />
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, fontSize: 12, border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
                   formatter={(value, name) => [`${value ?? 0} items`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="sentiment-legend">
                <span>
                  <i className="positive-dot" /> Positive{' '}
                  <b>
                    {insights?.sentimentBreakdown.POS ?? 0} <em>{posPct}%</em>
                  </b>
                </span>
                <span>
                  <i className="neutral-dot" /> Neutral{' '}
                  <b>
                    {insights?.sentimentBreakdown.NEU ?? 0} <em>{neuPct}%</em>
                  </b>
                </span>
                <span>
                  <i className="negative-dot" /> Negative{' '}
                  <b>
                    {insights?.sentimentBreakdown.NEG ?? 0} <em>{negPct}%</em>
                  </b>
                </span>
              </div>
            </Card>
          </div>

          <div className="lower-grid">
            <Card>
              <div className="panel-heading">
                <h3>Top Themes</h3>
              </div>
              <div className="bar-chart">
                {(insights?.topThemes ?? []).slice(0, 5).map((t) => (
                  <div key={t.name}>
                    <span>{t.name}</span>
                    <b style={{ width: `${Math.min(100, t.count * 4)}%` }} />
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="panel-heading">
                <h3>Trending Themes</h3>
              </div>
              <div className="trending-list">
                {trends.map((t) => (
                  <div key={t.themeId}>
                    <div>
                      <strong>{t.themeName}</strong>
                      <small>{t.currentCount} mentions</small>
                    </div>
                    <span>
                      {t.changePercent >= 0 ? '↑' : '↓'} {Math.abs(t.changePercent)}%
                    </span>
                    <Tag
                      className={
                        t.dominantSentiment === 'NEG' ? 'negative' : t.dominantSentiment === 'POS' ? 'positive' : 'neutral'
                      }
                    >
                      {t.dominantSentiment === 'NEG' ? 'NEGATIVE' : t.dominantSentiment === 'POS' ? 'POSITIVE' : 'NEUTRAL'}
                    </Tag>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {topSpike && (
            <div className="insight-banner">
              <div className="insight-icon">✣</div>
              <div>
                <strong>LOOP AI INSIGHT</strong>
                <p>
                  <b>{topSpike.themeName}</b> complaints increased <b>{topSpike.changePercent}%</b> this period, now
                  at {topSpike.currentCount} mentions, up from {topSpike.previousCount} in the prior period.
                </p>
                <small>Based on {topSpike.currentCount} feedback items · Updated just now</small>
              </div>
              <Link href="/feedback">
                <Button>View feedback</Button>
              </Link>
            </div>
          )}

          <Card className="recent-card">
            <div className="recent-heading">
              <h3>Recent Feedback</h3>
              <Link href="/feedback">View all</Link>
            </div>
            <div className="feedback-table">
              <div className="table-header">
                <span>FEEDBACK</span>
                <span>CHANNEL</span>
                <span>SENTIMENT</span>
                <span>THEME</span>
                <span>STATUS</span>
                <span>DATE</span>
              </div>
              {recentFeedback.map((row) => (
                <div className="table-row" key={row.id}>
                  <span>
                    {row.content.slice(0, 60)}
                    {row.content.length > 60 ? '…' : ''}
                  </span>
                  <span>{row.channel}</span>
                  <Tag
                    className={
                      row.sentiment === 'NEG' ? 'negative' : row.sentiment === 'POS' ? 'positive' : 'neutral'
                    }
                  >
                    {row.sentiment === 'NEG'
                      ? 'NEGATIVE'
                      : row.sentiment === 'POS'
                      ? 'POSITIVE'
                      : row.sentiment === 'NEU'
                      ? 'NEUTRAL'
                      : 'UNCLASSIFIED'}
                  </Tag>
                  <span>{row.themes[0]?.theme.name ?? '—'}</span>
                  <Tag
                    className={
                      row.status === 'ACTIONED' ? 'status-actioned' : row.status === 'REVIEWED' ? 'status-reviewed' : 'status-new'
                    }
                  >
                    {row.status}
                  </Tag>
                  <span>{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}