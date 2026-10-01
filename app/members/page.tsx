'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogoutOutlined } from '@ant-design/icons'
import { Topbar } from '@/components/Topbar'
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
import { Button, Card, Select, Tag, Modal, Form, Input, message, Popconfirm } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

interface Member {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'ANALYST' | 'VIEWER'
  createdAt: string
}

export default function MembersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/workspace/members')
    const data = await res.json()
    setMembers(data.members ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status])

  const isAdmin = session?.user?.role === 'ADMIN'

  const changeRole = async (id: string, role: string) => {
    const res = await fetch(`/api/workspace/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      const data = await res.json()
      message.error(data.error ?? 'Failed to update role')
    } else {
      message.success('Role updated')
    }
    load()
  }

  const removeMember = async (id: string) => {
    const res = await fetch(`/api/workspace/members/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      message.error(data.error ?? 'Failed to remove member')
    } else {
      message.success('Member removed')
    }
    load()
  }

  const invite = async () => {
    try {
      const values = await form.validateFields()
      const res = await fetch('/api/workspace/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        message.error(data.error ?? 'Failed to add member')
        return
      }
      message.success('Member added')
      setAddOpen(false)
      form.resetFields()
      load()
    } catch {
      // validation error, form shows it
    }
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
          <Link href="/reports">
            <button>
              <FileTextOutlined /> Reports
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
          <button className="active">
            <UserOutlined /> Members
          </button>
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
          <div className="overview-heading">
            <div>
              <h1>Members</h1>
              <p>Manage who has access to this workspace and their roles.</p>
            </div>
            {isAdmin && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
                Add member
              </Button>
            )}
          </div>

          <Card className="feedback-card">
            <div className="feedback-grid feedback-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
              <span>NAME</span>
              <span>EMAIL</span>
              <span>ROLE</span>
              <span>{isAdmin ? 'ACTIONS' : ''}</span>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
            ) : (
              members.map((m) => (
                <div
                  className="feedback-grid feedback-row"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}
                  key={m.id}
                >
                  <strong>{m.name}</strong>
                  <span>{m.email}</span>
                  {isAdmin ? (
                    <Select
                      size="small"
                      value={m.role}
                      onChange={(v) => changeRole(m.id, v)}
                      disabled={m.id === session?.user?.id}
                      options={[
                        { value: 'ADMIN', label: 'ADMIN' },
                        { value: 'ANALYST', label: 'ANALYST' },
                        { value: 'VIEWER', label: 'VIEWER' },
                      ]}
                    />
                  ) : (
                    <Tag>{m.role}</Tag>
                  )}
                  {isAdmin && m.id !== session?.user?.id ? (
                    <Popconfirm title="Remove this member?" onConfirm={() => removeMember(m.id)}>
                      <Button danger size="small">
                        Remove
                      </Button>
                    </Popconfirm>
                  ) : (
                    <span />
                  )}
                </div>
              ))
            )}
          </Card>
        </main>
      </div>

      <Modal title="Add member" open={addOpen} onCancel={() => setAddOpen(false)} onOk={invite} okText="Add">
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Temporary password" name="password" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]} initialValue="VIEWER">
            <Select
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'ANALYST', label: 'ANALYST' },
                { value: 'VIEWER', label: 'VIEWER' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}