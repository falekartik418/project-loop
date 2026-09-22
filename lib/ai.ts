// lib/ai.ts
// This is the one place in the whole app that talks to the AI provider.
// Once your mentor confirms which API to use tonight, we'll fill in the
// actual fetch call inside classifyFeedback() below — everything else
// (the route that calls this, the validation, saving results) is already
// wired up to expect this exact return shape.

import { z } from 'zod'

const classificationSchema = z.object({
  sentiment: z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1),
  featureArea: z.string(),
  rationale: z.string(),
})

export type Classification = z.infer<typeof classificationSchema>

export async function classifyFeedback(
  content: string,
  existingThemeNames: string[],
): Promise<Classification> {
  // TODO: fill this in once we know the provider (Gemini or Groq).
  // The prompt should:
  //  1. Send `content` plus `existingThemeNames` so the model reuses
  //     themes instead of inventing new ones each time.
  //  2. Ask for ONLY JSON matching classificationSchema above.
  //  3. Strip any stray markdown fences before parsing.
  //  4. Validate with classificationSchema.safeParse() before returning.
  //  5. On parse failure, retry once, then throw so the caller can flag
  //     the item for manual review instead of crashing.

  throw new Error('classifyFeedback: AI provider not wired up yet')
}