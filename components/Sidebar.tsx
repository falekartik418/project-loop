'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Tag } from 'antd'
import {
  BarChartOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LineChartOutlined,
  LogoutOutlined,
  RadarChartOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'

export function Sidebar({ active }: { active?: string }) {
  const { data: session } = useSession()

  const item = (key: string, href: string, icon: React.ReactNode, label: React.ReactNode) => (
    <Link href={href}>
      <button className={active === key ? 'active' : ''}>
        {icon} {label}
      </button>
    </Link>
  )

  return (
    <aside className="app-sidebar">
      <div className="app-logo">
        <span className="mark" aria-hidden="true">
          <span />
          <span />
        </span>{' '}
        LOOP
      </div>
      <nav className="app-nav">
        {item('overview', '/dashboard', <BarChartOutlined />, 'Overview')}
        {item('feedback', '/feedback', <FileTextOutlined />, 'Feedback')}
        {item('trends', '/trends', <LineChartOutlined />, 'Trends')}
        {item('ask', '/ask', <RadarChartOutlined />, <>Ask LOOP <Tag>AI</Tag></>)}
        {item('reports', '/reports', <FileTextOutlined />, 'Reports')}
        {item('themes', '/themes', <BgColorsOutlined />, 'Themes')}
      </nav>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="app-nav secondary">
        <button>
          <DatabaseOutlined /> Workspace
        </button>
        {item('members', '/members', <UserOutlined />, 'Members')}
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
  )
}