'use client'

import { useState } from 'react'
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

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const onFinish = async (values: { email: string }) => {
    setLoading(true)
    setResetLink(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      setSubmitted(true)
      if (data.resetLink) {
        setResetLink(data.resetLink)
      }
    } catch {
      message.error('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <section className="login-pitch">
        <Link className="login-brand" href="/">
          <Mark /> LOOP
        </Link>
        <div className="pitch-copy">
          <h1>
            Forgot your
            <br />
            password?
          </h1>
          <p>
            Enter the email address for your account and we&apos;ll
            <br />
            help you reset your password.
          </p>
        </div>
      </section>
      <section className="login-panel">
        <Card className="login-card" variant="borderless">
          <h2>Reset password</h2>
          <p className="login-subtitle">Enter your account email below.</p>

          {submitted ? (
            <div>
              <p style={{ color: '#4a5b7c', marginBottom: 16 }}>
                If an account exists for that email, a reset link has been generated.
              </p>
              {resetLink && (
                <div style={{ background: '#f2f4ff', border: '1px solid #dce2e9', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#647793', marginBottom: 8 }}>
                    This project has no email service configured, so here is your reset link directly (in production, this would be emailed instead):
                  </p>
                  <Link href={resetLink} style={{ wordBreak: 'break-all', fontSize: 13 }}>
                    {resetLink}
                  </Link>
                </div>
              )}
              <Link href="/login">
                <Button block size="large">Back to login</Button>
              </Link>
            </div>
          ) : (
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                label="Email"
                name="email"
                normalize={(value) => (typeof value === 'string' ? value.trim() : value)}
                rules={[{ required: true, type: 'email', message: 'Enter a valid email address.' }]}
              >
                <Input size="large" placeholder="you@company.com" />
              </Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                className="sign-in-button"
                loading={loading}
              >
                Send reset link
              </Button>
              <p className="signup-line">
                <Link href="/login">Back to login</Link>
              </p>
            </Form>
          )}
        </Card>
      </section>
    </div>
  )
}