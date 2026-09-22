import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/guard'

// POST /api/feedback/channel — simulates pulling feedback from an external
// integration (e.g. "App Store reviews"). No real third-party call happens —
// per the brief, real integrations are explicitly out of scope. This just
// drops in a batch of realistic sample items tagged with the chosen channel.
const SAMPLES: Record<string, string[]> = {
  'App store review': [
    'Update broke my saved filters, please fix soon.',
    'Five stars, this app just works.',
    'Crashes on launch since the last update.',
  ],
  'Support ticket': [
    'Cannot reset my password, the email never arrives.',
    'Great support, resolved my issue in minutes.',
    'The export button is missing on my plan tier.',
  ],
  'Social mention': [
    'Just switched to this tool and the onboarding was smooth!',
    'Wish there was a dark mode option.',
    'Anyone else having trouble with the mobile app today?',
  ],
}

export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'ANALYST'])
  if (auth instanceof NextResponse) return auth
  const { session } = auth

  const body = await req.json().catch(() => ({}))
  const channel: string = body.channel && SAMPLES[body.channel] ? body.channel : 'App store review'

  const items = SAMPLES[channel]
  const created = await Promise.all(
    items.map((content) =>
      db.feedback.create({
        data: {
          content,
          channel,
          workspaceId: session.user.workspaceId,
          status: 'NEW',
        },
      }),
    ),
  )

  return NextResponse.json({ imported: created.length, channel })
}