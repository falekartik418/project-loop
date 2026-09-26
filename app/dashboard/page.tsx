'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  BarChartOutlined,
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
  volumeOverTime: Array<{ date: string; count: number }>
  sentimentBreakdown: { POS: number; NEU: number; NEG: number; unclassified: number }
  topThemes: Array<{ name: string; count: number }>
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
  const router = useRouter()
  const [insights, setInsights] = useState<InsightsData | null>(null)
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
      const [insightsRes, feedbackRes] = await Promise.all([
        fetch('/api/insights'),
        fetch('/api/feedback?page=1'),
      ])
      const insightsData = await insightsRes.json()
      const feedbackData = await feedbackRes.json()
      setInsights(insightsData)
      setRecentFeedback(feedbackData.items.slice(0, 6))
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
        </nav>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="app-nav secondary">
          <button>
            <DatabaseOutlined /> Workspace
          </button>
          <button>
            <UserOutlined /> Members
          </button>
          <button>
            <SettingOutlined /> Settings
          </button>
        </nav>
        <div className="user-switch" onClick={() => signOut({ callbackUrl: '/login' })} style={{ cursor: 'pointer' }}>
          <span>{session?.user?.name?.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{session?.user?.name}</strong>
            <small>{session?.user?.role}</small>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="search-box">
            <SearchOutlined /> <span>Search LOOP...</span>
            <kbd>⌘K</kbd>
          </div>
          <div className="top-actions">
            <BellOutlined />
            <MoonOutlined />
            <span className="avatar">{session?.user?.name?.slice(0, 2).toUpperCase()}</span>
          </div>
        </header>
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

          <div className="lower-grid">
            <Card>
              <div className="panel-heading">
                <h3>Top Themes</h3>
              </div>
              <div className="bar-chart">
                {(insights?.topThemes ?? []).map((t) => (
                  <div key={t.name}>
                    <span>{t.name}</span>
                    <b style={{ width: `${Math.min(100, t.count * 2)}%` }} />
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="panel-heading">
                <h3>Sentiment breakdown</h3>
              </div>
              <div className="sentiment-legend">
                <span>
                  <i className="positive-dot" /> Positive{' '}
                  <b>
                    {insights?.sentimentBreakdown.POS ?? 0}{' '}
                    <em>{totalSentiment ? Math.round(((insights?.sentimentBreakdown.POS ?? 0) / totalSentiment) * 100) : 0}%</em>
                  </b>
                </span>
                <span>
                  <i className="neutral-dot" /> Neutral{' '}
                  <b>
                    {insights?.sentimentBreakdown.NEU ?? 0}{' '}
                    <em>{totalSentiment ? Math.round(((insights?.sentimentBreakdown.NEU ?? 0) / totalSentiment) * 100) : 0}%</em>
                  </b>
                </span>
                <span>
                  <i className="negative-dot" /> Negative{' '}
                  <b>
                    {insights?.sentimentBreakdown.NEG ?? 0}{' '}
                    <em>{totalSentiment ? Math.round(((insights?.sentimentBreakdown.NEG ?? 0) / totalSentiment) * 100) : 0}%</em>
                  </b>
                </span>
              </div>
            </Card>
          </div>

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
                  <span>{row.content.slice(0, 60)}{row.content.length > 60 ? '…' : ''}</span>
                  <span>{row.channel}</span>
                  <Tag className={(row.sentiment ?? 'neutral').toLowerCase()}>{row.sentiment ?? 'UNCLASSIFIED'}</Tag>
                  <span>{row.themes[0]?.theme.name ?? '—'}</span>
                  <Tag className="status-tag">{row.status}</Tag>
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