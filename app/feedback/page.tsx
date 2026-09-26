'use client'

import { useEffect, useState, useCallback } from 'react'
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
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, Select, Tag, Modal, Form, message } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface FeedbackItem {
  id: string
  content: string
  channel: string
  sentiment: string | null
  featureArea: string | null
  status: string
  createdAt: string
  themes: Array<{ theme: { name: string } }>
}

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState<string | undefined>()
  const [sentiment, setSentiment] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const load = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (channel) params.set('channel', channel)
    if (sentiment) params.set('sentiment', sentiment)
    if (statusFilter) params.set('status', statusFilter)

    const res = await fetch(`/api/feedback?${params.toString()}`)
    const data = await res.json()
    setItems(data.items)
    setTotal(data.total)
    setTotalPages(data.totalPages)
    setLoading(false)
  }, [status, page, search, channel, sentiment, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  const addFeedback = async () => {
    try {
      const values = await form.validateFields()
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error()
      message.success('Feedback added')
      setAddOpen(false)
      form.resetFields()
      load()
    } catch {
      message.error('Failed to add feedback')
    }
  }

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const res = await fetch('/api/feedback/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: text,
    })
    const result = await res.json()
    message.success(`Imported ${result.imported}, failed ${result.failed}`)
    load()
    e.target.value = ''
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
          <button className="active">
            <FileTextOutlined /> Feedback
          </button>
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
          </div>
        </header>
        <main className="feedback-content">
          <div className="feedback-heading">
            <div>
              <h1>Feedback</h1>
              <p>Search, filter, and triage customer feedback.</p>
            </div>
            <div>
              <label htmlFor="csv-upload">
                <Button icon={<UploadOutlined />} onClick={() => document.getElementById('csv-upload')?.click()}>
                  Import CSV
                </Button>
              </label>
              <input id="csv-upload" type="file" accept=".csv" hidden onChange={importCSV} />
              <Button type="primary" className="feedback-add" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
                Add feedback
              </Button>
            </div>
          </div>
          <Card className="feedback-filters">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search customer feedback..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <Select
              allowClear
              placeholder="Channel"
              value={channel}
              onChange={(v) => {
                setChannel(v)
                setPage(1)
              }}
              options={[
                { value: 'Support ticket', label: 'Support ticket' },
                { value: 'App store review', label: 'App store review' },
                { value: 'NPS survey', label: 'NPS survey' },
                { value: 'Sales call note', label: 'Sales call note' },
                { value: 'Community post', label: 'Community post' },
              ]}
            />
            <Select
              allowClear
              placeholder="Sentiment"
              value={sentiment}
              onChange={(v) => {
                setSentiment(v)
                setPage(1)
              }}
              options={[
                { value: 'POS', label: 'Positive' },
                { value: 'NEU', label: 'Neutral' },
                { value: 'NEG', label: 'Negative' },
              ]}
            />
            <Select
              allowClear
              placeholder="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
              options={[
                { value: 'NEW', label: 'New' },
                { value: 'REVIEWED', label: 'Reviewed' },
                { value: 'ACTIONED', label: 'Actioned' },
              ]}
            />
          </Card>
          <Card className="feedback-card">
            <div className="feedback-meta">
              <span>{total} items</span>
            </div>
            <div className="feedback-grid feedback-header">
              <span>FEEDBACK</span>
              <span>CHANNEL</span>
              <span>SENTIMENT</span>
              <span>THEME</span>
              <span>FEATURE AREA</span>
              <span>STATUS</span>
              <span>DATE</span>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8ba0bd' }}>No feedback found.</div>
            ) : (
              items.map((row) => (
                <div className="feedback-grid feedback-row" key={row.id}>
                  <div>
                    <strong>{row.content.slice(0, 70)}{row.content.length > 70 ? '…' : ''}</strong>
                  </div>
                  <span>{row.channel}</span>
                  <Tag className={(row.sentiment ?? 'neutral').toLowerCase()}>{row.sentiment ?? 'UNCLASSIFIED'}</Tag>
                  <div className="theme-tags">
                    {row.themes.map((t) => (
                      <Tag key={t.theme.name}>{t.theme.name}</Tag>
                    ))}
                  </div>
                  <span>{row.featureArea ?? '—'}</span>
                  <Select
                    size="small"
                    value={row.status}
                    onChange={(v) => updateStatus(row.id, v)}
                    options={[
                      { value: 'NEW', label: 'NEW' },
                      { value: 'REVIEWED', label: 'REVIEWED' },
                      { value: 'ACTIONED', label: 'ACTIONED' },
                    ]}
                  />
                  <span>{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
            <div className="feedback-pagination">
              <span>
                Page {page} of {totalPages || 1}
              </span>
              <div>
                <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ‹
                </Button>
                <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  ›
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>

      <Modal title="Add feedback" open={addOpen} onCancel={() => setAddOpen(false)} onOk={addFeedback} okText="Add">
        <Form form={form} layout="vertical">
          <Form.Item label="Content" name="content" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Channel" name="channel" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Support ticket', label: 'Support ticket' },
                { value: 'App store review', label: 'App store review' },
                { value: 'NPS survey', label: 'NPS survey' },
                { value: 'Sales call note', label: 'Sales call note' },
                { value: 'Community post', label: 'Community post' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}