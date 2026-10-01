'use client'

import Link from 'next/link'
import { Button, Card, Tag } from 'antd'
import {
  ArrowRightOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LineChartOutlined,
  RadarChartOutlined,
} from '@ant-design/icons'

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

const workflow: [string, string, string][] = [
  ['01', 'Collect', 'Centralize feedback from support, reviews, surveys, and sales in one workspace.'],
  ['02', 'Understand', 'AI automatically classifies every piece of feedback by theme, sentiment, and feature area.'],
  ['03', 'Discover', 'Identify emerging trends and spikes before they become problems for your customers.'],
  ['04', 'Ask', 'Ask LOOP natural-language questions and get evidence-backed answers instantly.'],
  ['05', 'Act', 'Turn insights into actionable Voice-of-Customer reports for your entire team.'],
]

const features: [React.ReactNode, string, string, string][] = [
  [<BarChartOutlined key="bars" />, 'AI-Powered Classification', 'Every feedback item is automatically classified by theme, feature area, and sentiment. No manual tagging required.', 'Real, working AI classification'],
  [<LineChartOutlined key="trend" />, 'Theme Intelligence', "Surface emerging customer needs as they appear. Know what is rising, what's spiking, and what to prioritize next.", 'Real-time trend detection'],
  [<RadarChartOutlined key="spark" />, 'Ask LOOP', 'Ask questions about your customer feedback in plain English. Get answers grounded in real evidence from your data.', 'Evidence-backed answers'],
  [<FileTextOutlined key="doc" />, 'Voice-of-Customer Reports', 'Generate polished, data-backed reports in seconds. Share structured summaries with your leadership team.', 'One-click report generation'],
]

export default function LandingPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="page-shell">
      <header className="nav">
        <a className="brand" href="#top">
          <Mark /> LOOP
        </a>
        <nav>
          <button onClick={() => scrollTo('product')}>Product</button>
          <button onClick={() => scrollTo('workflow')}>How it works</button>
          <button onClick={() => scrollTo('features')}>AI insights</button>
        </nav>
        <div className="nav-actions">
          <Link href="/login">
            <Button type="text" className="login">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button type="primary" className="button button-small">
              Get started <ArrowRightOutlined />
            </Button>
          </Link>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" id="product">
          <Tag className="eyebrow">
            <span>✦</span> AI CUSTOMER FEEDBACK INTELLIGENCE
          </Tag>
          <h1>
            Turn customer feedback
            <br />
            into your next best
            <br />
            <em>decision.</em>
          </h1>
          <p className="hero-copy">
            LOOP brings scattered customer feedback into one intelligent workspace,
            <br className="desktop-only" /> revealing what customers love, what frustrates them, and what needs
            attention next.
          </p>
          <div className="hero-actions">
            <Link href="/signup">
              <Button type="primary" className="button">
                Get started <ArrowRightOutlined />
              </Button>
            </Link>
            <Button className="button button-outline" onClick={() => scrollTo('workflow')}>
              See how it works
            </Button>
          </div>
        </section>

        <section className="workflow section-band" id="workflow">
          <div className="section-heading">
            <h2>From scattered feedback to clear decisions.</h2>
            <p>One end-to-end workflow for understanding your customers.</p>
          </div>
          <div className="workflow-grid">
            {workflow.map(([number, title, text]) => (
              <Card bordered={false} className="workflow-card" key={title}>
                <small>{number}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-heading">
            <h2>Intelligence built for product teams.</h2>
            <p>Every feature designed around a single question: what should you work on next?</p>
          </div>
          <div className="feature-grid">
            {features.map(([icon, title, text, detail]) => (
              <Card bordered={false} className="feature-card" key={title as string}>
                <div className="feature-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
                <small>◉ {detail}</small>
              </Card>
            ))}
          </div>
        </section>

        <section className="cta" id="cta">
          <h2>Ready to close the loop?</h2>
          <p>Start understanding your customers in minutes.</p>
          <div>
            <Link href="/signup">
              <Button type="primary" className="button">
                Get started free <ArrowRightOutlined />
              </Button>
            </Link>
            <Link href="/login">
              <Button className="button button-outline">Log in</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer id="footer">
        <a className="brand" href="#top">
          <Mark /> LOOP
        </a>
        <span>© 2026. Built for the Zidio internship.</span>
      </footer>
    </div>
  )
}