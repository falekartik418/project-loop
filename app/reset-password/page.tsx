'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Form, Input, message } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onFinish = async (values: { password: string }) => {
    if (!token) {
      message.error('This reset link is missing its token.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: values.password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      message.error(data.error ?? 'Failed to reset password.')
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <Card className="login-card" variant="borderless">
      <h2>Set a new password</h2>
      <p className="login-subtitle">Choose a new password for your account.</p>

      {!token ? (
        <p style={{ color: '#b3202e' }}>This reset link is invalid — no token was found.</p>
      ) : done ? (
        <p style={{ color: '#0a7a4f' }}>Password updated. Redirecting to login...</p>
      ) : (
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="New password"
            name="password"
            rules={[{ required: true, min: 8, message: 'Password must be at least 8 characters.' }]}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            block
            className="sign-in-button"
            loading={loading}
          >
            Reset password
          </Button>
        </Form>
      )}
      <p className="signup-line">
        <Link href="/login">Back to login</Link>
      </p>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="login-page">
      <section className="login-pitch">
        <Link className="login-brand" href="/">
          <Mark /> LOOP
        </Link>
        <div className="pitch-copy">
          <h1>
            Almost
            <br />
            there.
          </h1>
          <p>Enter a new password to regain access to your workspace.</p>
        </div>
      </section>
      <section className="login-panel">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </div>
  )
}