'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogoutOutlined } from '@ant-design/icons'
import { Topbar } from '@/components/Topbar'
import { useReadOnly } from '@/components/useReadOnly'
import {
  BarChartOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PlusOutlined,
  RadarChartOutlined,
  SettingOutlined,
  UserOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { Button, Card, Tag, Empty, Popconfirm, message } from 'antd'

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
      sampleQuotes?: string[]
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
  const [messageApi, contextHolder] = message.useMessage()
  const { isViewer, showReadOnly, contextHolder: readOnlyHolder } = useReadOnly()

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
    if (isViewer) {
      showReadOnly()
      return
    }
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

  const deleteReport = async (id: string) => {
    if (isViewer) {
      showReadOnly()
      return
    }
    const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return messageApi.error(data.error ?? 'Could not delete report')
    }
    messageApi.success('Report deleted')
    if (selected?.id === id) setSelected(null)
    await load()
  }

  const exportPdf = () => {
  if (!selected) return
  if (isViewer) {
    showReadOnly()
    return
  }
  window.print()
}

  return (
    <div className="app-shell">
      {contextHolder}
      {readOnlyHolder}
      <aside className="app-sidebar no-print">
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
          <Link href="/themes">
            <button>
              <BgColorsOutlined /> Themes
            </button>
          </Link>
        </nav>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="app-nav secondary">
          <Link href="/workspace">
            <button>
              <DatabaseOutlined /> Workspace
            </button>
          </Link>
          <Link href="/members">
            <button>
              <UserOutlined /> Members
            </button>
          </Link>
          <Link href="/settings">
            <button>
              <SettingOutlined /> Settings
            </button>
          </Link>
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
          <div className="overview-heading no-print">
            <div>
              <h1>Voice of Customer Reports</h1>
              <p>AI-generated summaries of your feedback, ready to share.</p>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={generate} loading={generating}>
              Generate report (last 30 days)
            </Button>
          </div>

          {selected ? (
            <>
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Button type="text" onClick={() => setSelected(null)}>
                  ← Back to all reports
                </Button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Popconfirm
                    title="Delete this report?"
                    description="This cannot be undone."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    disabled={isViewer}
                    onConfirm={() => deleteReport(selected.id)}
                  >
                    <Button danger icon={<DeleteOutlined />} onClick={isViewer ? showReadOnly : undefined}>
                      Delete
                    </Button>
                  </Popconfirm>
                  <Button icon={<DownloadOutlined />} onClick={exportPdf}>
                    Export PDF
                  </Button>
                </div>
              </div>

              <Card className="report-print-area">
                <div className="report-print-header">
                  <strong>LOOP — Voice of Customer Report</strong>
                </div>
                <h2>{selected.title}</h2>
                <p style={{ color: '#647793', marginBottom: 20 }}>
                  {new Date(selected.periodStart).toLocaleDateString()} –{' '}
                  {new Date(selected.periodEnd).toLocaleDateString()} · Generated by {selected.generatedBy?.name} on{' '}
                  {new Date(selected.createdAt).toLocaleDateString()}
                </p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <Tag color="green">POS {selected.contentJson.stats.sentimentBreakdown.POS}</Tag>
                  <Tag color="default">NEU {selected.contentJson.stats.sentimentBreakdown.NEU}</Tag>
                  <Tag color="red">NEG {selected.contentJson.stats.sentimentBreakdown.NEG}</Tag>
                  <Tag>{selected.contentJson.stats.totalItems} total items</Tag>
                </div>

                {selected.contentJson.stats.topThemes?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>Top Themes</h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selected.contentJson.stats.topThemes.map((t) => (
                        <Tag key={t.name}>{t.name} ({t.count})</Tag>
                      ))}
                    </div>
                  </div>
                )}

                <h4 style={{ marginBottom: 8 }}>Summary</h4>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#203654', marginBottom: 20 }}>
                  {selected.contentJson.narrative}
                </p>

                {selected.contentJson.stats.sampleQuotes && selected.contentJson.stats.sampleQuotes.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: 8 }}>Representative Quotes</h4>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {selected.contentJson.stats.sampleQuotes.map((q, i) => (
                        <div key={i} style={{ borderLeft: '3px solid #dce2e9', paddingLeft: 12, color: '#4a5b7c', fontStyle: 'italic' }}>
                          &quot;{q}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </>
          ) : loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
          ) : reports.length === 0 ? (
            <Card>
              <Empty description="No reports yet. Generate your first one." />
            </Card>
                    ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {reports.map((r, i) => {
                const palette = ['#645df1', '#0fb987', '#3d7fec', '#fb7117', '#e6a700', '#f43f5e']
                const c = palette[i % palette.length]
                const neg = r.contentJson.stats.sentimentBreakdown.NEG
                const pos = r.contentJson.stats.sentimentBreakdown.POS
                const total = r.contentJson.stats.totalItems
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="report-card"
                    style={{ borderLeft: `4px solid ${c}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span className="report-card-icon" style={{ background: `${c}20`, color: c }}>
                        <FileTextOutlined />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 15.5 }}>{r.title}</h3>
                        <p style={{ margin: '4px 0 0', color: '#8b95ab', fontSize: 12.5 }}>
                          Generated by {r.generatedBy?.name} on {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="report-stat-pill" style={{ background: `${c}18`, color: c }}>
                          {total} items
                        </span>
                        <span className="report-stat-pill" style={{ background: '#09b98318', color: '#09b983' }}>
                          {pos} pos
                        </span>
                        <span className="report-stat-pill" style={{ background: '#ff535b18', color: '#ff535b' }}>
                          {neg} neg
                        </span>
                        <span className="report-card-cta" style={{ color: c }}>View →</span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <Popconfirm
                            title="Delete this report?"
                            description="This cannot be undone."
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                            disabled={isViewer}
                            onConfirm={() => deleteReport(r.id)}
                          >
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={isViewer ? showReadOnly : undefined}
                            />
                          </Popconfirm>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}