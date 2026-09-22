import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const CHANNELS = ['Support ticket', 'App store review', 'NPS survey', 'Sales call note', 'Community post']
const SENTIMENTS: Array<'POS' | 'NEU' | 'NEG'> = ['POS', 'NEU', 'NEG']

const SAMPLE_CONTENT = [
  'Onboarding took forever — I couldn\'t figure out how to invite my team.',
  'The new dashboard is gorgeous and finally fast. Huge improvement.',
  'It does the job, but the mobile experience needs work.',
  'Prospect wants SSO before they\'ll sign — third time this month.',
  'Love the new export feature, saved me an hour today.',
  'Billing page keeps timing out when I try to download an invoice.',
  'Support response time has gotten so much better lately.',
  'Can we get dark mode? Half my team is asking for it.',
  'The search feature barely returns relevant results.',
  'Integration with Slack works flawlessly now.',
]

async function main() {
  console.log('Seeding database...')

  // Clean slate for repeatable seeding
  await db.feedbackTheme.deleteMany()
  await db.embedding.deleteMany()
  await db.report.deleteMany()
  await db.feedback.deleteMany()
  await db.theme.deleteMany()
  await db.user.deleteMany()
  await db.workspace.deleteMany()

  const workspace = await db.workspace.create({
    data: { name: 'Acme Demo Co' },
  })

  const passwordHash = await bcrypt.hash('password123', 12)

  await db.user.create({
    data: { name: 'Alex Admin', email: 'admin@loop.com', passwordHash, role: 'ADMIN', workspaceId: workspace.id },
  })
  await db.user.create({
    data: { name: 'Ana Analyst', email: 'analyst@loop.com', passwordHash, role: 'ANALYST', workspaceId: workspace.id },
  })
  await db.user.create({
    data: { name: 'Vic Viewer', email: 'viewer@loop.com', passwordHash, role: 'VIEWER', workspaceId: workspace.id },
  })

  const themeNames = ['Onboarding', 'Billing', 'Performance', 'Mobile experience', 'Integrations']
  const themes = await Promise.all(
    themeNames.map((name) => db.theme.create({ data: { name, workspaceId: workspace.id } })),
  )

  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 60)
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    const feedback = await db.feedback.create({
      data: {
        content: SAMPLE_CONTENT[i % SAMPLE_CONTENT.length],
        channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
        sentiment: SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)],
        sentimentScore: Math.random() * 2 - 1,
        status: 'NEW',
        workspaceId: workspace.id,
        createdAt,
      },
    })

    const randomTheme = themes[Math.floor(Math.random() * themes.length)]
    await db.feedbackTheme.create({
      data: { feedbackId: feedback.id, themeId: randomTheme.id, confidence: Math.random() },
    })
  }

  console.log('Seed complete:')
  console.log('  Admin:   admin@loop.com   / password123')
  console.log('  Analyst: analyst@loop.com / password123')
  console.log('  Viewer:  viewer@loop.com  / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })