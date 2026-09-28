'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button, Card, Form, Input, Steps, message } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<{ name?: string; email?: string; password?: string; workspaceName?: string }>({})

  const stepOne = (v: { name: string; email: string; password: string }) => {
    setValues((prev) => ({ ...prev, ...v }))
    setStep(1)
  }

  const stepTwo = async (v: { workspaceName: string }) => {
    const finalValues = { ...values, ...v }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalValues),
      })
      const data = await res.json()
      if (!res.ok) {
        message.error(data.error ?? 'Signup failed')
        setLoading(false)
        return
      }

      const signInResult = await signIn('credentials', {
        email: finalValues.email,
        password: finalValues.password,
        redirect: false,
      })

      if (signInResult?.error) {
        message.error('Account created — please log in.')
        router.push('/login')
        return
      }

      setStep(2)
    } catch {
      message.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="setup-page">
      <Link className="setup-brand" href="/">
        <Mark /> LOOP
      </Link>
      <Steps
        className="setup-steps"
        current={step}
        items={[{ title: 'Create account' }, { title: 'Your workspace' }, { title: 'All set' }]}
      />
      <Card className="setup-card" bordered={false}>
        {step === 0 && (
          <>
            <h2>Create your account</h2>
            <p>Get started with LOOP in under a minute.</p>
            <Form layout="vertical" requiredMark={false} onFinish={stepOne}>
              <Form.Item label="Full name" name="name" rules={[{ required: true, message: 'Enter your name.' }]}>
                <Input placeholder="Alex Rivera" />
              </Form.Item>
              <Form.Item
              label="Email"
              name="email"
              normalize={(value) => (typeof value === 'string' ? value.trim() : value)}
              rules={[{ required: true, type: 'email', message: 'Enter a valid email address.' }]}
            >
                <Input placeholder="you@company.com" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, min: 8, message: 'Use at least 8 characters.' }]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
              <Button htmlType="submit" type="primary" block className="setup-button">
                Continue
              </Button>
            </Form>
            <p className="setup-switch">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <h2>Create your workspace</h2>
            <p>This is where your team will collaborate on feedback.</p>
            <Form layout="vertical" requiredMark={false} onFinish={stepTwo}>
              <Form.Item
                label="Workspace name"
                name="workspaceName"
                rules={[{ required: true, message: 'Enter a workspace name.' }]}
              >
                <Input placeholder="Acme Corp" />
              </Form.Item>
              <small className="field-hint">Usually your company name.</small>
              <Button htmlType="submit" type="primary" block className="setup-button" loading={loading}>
                Create workspace
              </Button>
            </Form>
            <p className="setup-switch">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
        {step === 2 && (
          <div className="setup-complete">
            <div className="complete-icon">
              <CheckCircleOutlined />
            </div>
            <h2>Welcome to LOOP</h2>
            <p>Your workspace is ready. Let&apos;s set up your feedback pipeline.</p>
            <Button type="primary" block className="setup-button" onClick={() => router.push('/dashboard')}>
              Get started
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}