'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button, Card, Form, Input, message } from 'antd'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      message.error('Invalid email or password.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="login-page">
      <section className="login-pitch">
        <Link className="login-brand" href="/">
          <Mark /> LOOP
        </Link>
        <div className="pitch-copy">
          <h1>
            Understand what your
            <br />
            customers are really
            <br />
            saying.
          </h1>
          <p>
            LOOP uses AI to classify, analyze, and surface insights
            <br />
            from your customer feedback — so your team can make
            <br />
            decisions with confidence.
          </p>
        </div>
      </section>
      <section className="login-panel">
        <Card className="login-card" bordered={false}>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to your workspace.</p>
          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Enter a valid email address.' }]}
            >
              <Input size="large" placeholder="you@company.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters.' }]}
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
              Sign in
            </Button>
          </Form>
          <p className="signup-line">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </p>
        </Card>
      </section>
    </div>
  )
}