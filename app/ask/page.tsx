'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowRightOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LineChartOutlined,
  RadarChartOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, Tag } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface UsedFeedback {
  id: string
  content: string
  channel: string
  similarity: number
}

export default function AskPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [usedFeedback, setUsedFeedback] = useState<UsedFeedback[]>([])
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const suggested = [
    'What are customers most frustrated about?',
    'Which themes are growing fastest?',
    'What do customers want us to improve?',
    'What are users saying about billing?',
  ]

  const ask = async (q?: string) => {
    const finalQuestion = q ?? question
    if (!finalQuestion.trim()) return
    setAsking(true)
    setAnswer(null)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: finalQuestion }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnswer(data.error ?? 'Something went wrong.')
        setUsedFeedback([])
      } else {
        setAnswer(data.answer)
        setUsedFeedback(data.usedFeedback ?? [])
      }
    } catch {
      setAnswer('Failed to reach LOOP AI. Try again.')
    }
    setAsking(false)
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
          <button className="active">
            <RadarChartOutlined /> Ask LOOP <Tag>AI</Tag>
          </button>
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
        <main className="ask-content">
          <div className="ask-heading">
            <h1>
              <RadarChartOutlined /> Ask LOOP <Tag>AI</Tag>
            </h1>
            <p>Ask questions about what your customers are saying.</p>
          </div>
          <div className="ask-composer">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onPressEnter={() => ask()}
              placeholder="What are customers saying about onboarding?"
              suffix={
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => ask()} loading={asking} />
              }
            />
          </div>
          <div className="suggested-label">SUGGESTED QUESTIONS</div>
          <div className="suggested-grid">
            {suggested.map((prompt) => (
              <Button
                key={prompt}
                className="suggestion"
                onClick={() => {
                  setQuestion(prompt)
                  ask(prompt)
                }}
              >
                <RadarChartOutlined />
                <span>{prompt}</span>
                <ArrowRightOutlined />
              </Button>
            ))}
          </div>
          {asking ? (
            <div className="ask-note">
              <RadarChartOutlined />
              <span>LOOP is reading through your feedback...</span>
            </div>
          ) : answer ? (
            <Card className="ask-answer">
              <Tag color="purple">LOOP AI ANSWER</Tag>
              <p>{answer}</p>
              {usedFeedback.length > 0 && (
                <small>
                  Based on {usedFeedback.length} feedback item{usedFeedback.length !== 1 ? 's' : ''} · Evidence-backed
                  response
                </small>
              )}
            </Card>
          ) : (
            <div className="ask-note">
              <RadarChartOutlined />
              <span>LOOP will answer from your actual feedback data. If there isn&apos;t enough evidence, it will tell you so.</span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}