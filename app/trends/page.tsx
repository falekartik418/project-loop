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
  RadarChartOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Card, Tag } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface Trend {
  themeId: string
  themeName: string
  currentCount: number
  previousCount: number
  changePercent: number
  isSpiking: boolean
}

export default function TrendsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/trends')
      .then((r) => r.json())
      .then((data) => {
        setTrends(data.trends ?? [])
        setLoading(false)
      })
  }, [status])

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
          <button className="active">
            <LineChartOutlined /> Trends
          </button>
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
        <main className="trends-content">
          <div className="trends-heading">
            <div>
              <h1>Theme Trends</h1>
              <p>Identify emerging customer needs before they become bigger problems.</p>
            </div>
          </div>
          <Card className="all-themes-card">
            <h3>All themes</h3>
            <div className="themes-table">
              <div className="themes-header">
                <span>THEME</span>
                <span>MENTIONS</span>
                <span>PREVIOUS PERIOD</span>
                <span>CHANGE</span>
                <span>STATUS</span>
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
              ) : trends.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#8ba0bd' }}>
                  No theme data yet — classify some feedback first.
                </div>
              ) : (
                trends.map((t) => (
                  <div className="themes-row" key={t.themeId}>
                    <strong>{t.themeName}</strong>
                    <b>{t.currentCount}</b>
                    <span>{t.previousCount}</span>
                    <strong className={t.changePercent < 0 ? 'change-down' : 'change-up'}>
                      ⌁ {t.changePercent > 0 ? '+' : ''}
                      {t.changePercent}%
                    </strong>
                    <Tag className={`trend-status ${t.isSpiking ? '' : 'stable'}`}>
                      {t.isSpiking ? 'SPIKING' : 'STABLE'}
                    </Tag>
                  </div>
                ))
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}