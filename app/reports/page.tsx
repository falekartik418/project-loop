'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  BarChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PlusOutlined,
  RadarChartOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Card, Tag, Empty } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface Report {
  id: string
  title: string
  periodStart: string
  periodEnd: string
  createdAt: string
  contentJson: {
    narrative: string
    stats: {
      totalItems: number
      sentimentBreakdown: { POS: number; NEU: number; NEG: number }
      topThemes: Array<{ name: string; count: number }>
    }
  }
  generatedBy: { name: string }
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState<Report | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/reports')
    const data = await res.json()
    setReports(data.reports ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status])

  const generate = async () => {
    setGenerating(true)
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodDays: 30 }),
    })
    if (res.ok) {
      await load()
    }
    setGenerating(false)
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-logo">
          <Mark /> LOOP
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
          <button className="active">
            <FileTextOutlined /> Reports
          </button>
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
          </div>
        </header>
        <main className="overview-content">
          <div className="overview-heading">
            <div>
              <h1>Voice of Customer Reports</h1>
              <p>AI-generated summaries of your feedback, ready to share.</p>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={generate} loading={generating}>
              Generate report (last 30 days)
            </Button>
          </div>

          {selected ? (
            <Card>
              <Button type="text" onClick={() => setSelected(null)} style={{ marginBottom: 12 }}>
                ← Back to all reports
              </Button>
              <h2>{selected.title}</h2>
              <p style={{ color: '#647793', marginBottom: 20 }}>
                {new Date(selected.periodStart).toLocaleDateString()} –{' '}
                {new Date(selected.periodEnd).toLocaleDateString()} · By {selected.generatedBy?.name}
              </p>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <Tag color="green">POS {selected.contentJson.stats.sentimentBreakdown.POS}</Tag>
                <Tag color="default">NEU {selected.contentJson.stats.sentimentBreakdown.NEU}</Tag>
                <Tag color="red">NEG {selected.contentJson.stats.sentimentBreakdown.NEG}</Tag>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#203654' }}>
                {selected.contentJson.narrative}
              </p>
            </Card>
          ) : loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
          ) : reports.length === 0 ? (
            <Card>
              <Empty description="No reports yet. Generate your first one." />
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {reports.map((r) => (
                <Card
                  key={r.id}
                  hoverable
                  onClick={() => setSelected(r)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 style={{ margin: 0 }}>{r.title}</h3>
                  <p style={{ margin: '4px 0 0', color: '#647793', fontSize: 13 }}>
                    {r.contentJson.stats.totalItems} items · Generated by {r.generatedBy?.name} on{' '}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}