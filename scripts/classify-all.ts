import { PrismaClient } from '@prisma/client'
import { classifyFeedback, embedText } from '../lib/ai'

const db = new PrismaClient()
const DELAY_MS = 13000 // ~13s between calls, safely under the 5/min limit

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const unclassified = await db.feedback.findMany({
    where: { featureArea: null },
    select: { id: true, content: true, workspaceId: true },
  })

  console.log(`Found ${unclassified.length} unclassified feedback items.`)

  for (let i = 0; i < unclassified.length; i++) {
    const item = unclassified[i]
    console.log(`[${i + 1}/${unclassified.length}] Classifying ${item.id}...`)

    try {
      const existingThemes = await db.theme.findMany({
        where: { workspaceId: item.workspaceId },
        select: { id: true, name: true },
      })

      const result = await classifyFeedback(
        item.content,
        existingThemes.map((t) => t.name),
      )

      const themeRecords = await Promise.all(
        result.themes.map(async (name) => {
          const existing = existingThemes.find((t) => t.name.toLowerCase() === name.toLowerCase())
          if (existing) return existing
          return db.theme.create({ data: { name, workspaceId: item.workspaceId } })
        }),
      )

      await db.$transaction(async (tx) => {
        await tx.feedbackTheme.deleteMany({ where: { feedbackId: item.id } })
        await Promise.all(
          themeRecords.map((theme) =>
            tx.feedbackTheme.create({
              data: { feedbackId: item.id, themeId: theme.id, confidence: 0.8 },
            }),
          ),
        )
        await tx.feedback.update({
          where: { id: item.id },
          data: {
            sentiment: result.sentiment,
            sentimentScore: result.sentimentScore,
            featureArea: result.featureArea,
          },
        })
      })

      const vector = await embedText(item.content)
      await db.embedding.upsert({
        where: { feedbackId: item.id },
        create: { feedbackId: item.id, vector },
        update: { vector },
      })

      console.log(`  ✓ done (${result.sentiment}, ${result.featureArea})`)
    } catch (err) {
      console.error(`  ✗ failed:`, err instanceof Error ? err.message : err)
    }

    if (i < unclassified.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log('All done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })