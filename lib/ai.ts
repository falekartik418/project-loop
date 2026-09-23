import { z } from 'zod'

const classificationSchema = z.object({
  sentiment: z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1),
  featureArea: z.string(),
  rationale: z.string(),
})

export type Classification = z.infer<typeof classificationSchema>

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function buildPrompt(content: string, existingThemeNames: string[]): string {
  return `You are classifying a single piece of customer feedback for a product team.

Feedback: "${content}"

Existing themes already in use (reuse one of these if it fits, instead of inventing a near-duplicate): ${
    existingThemeNames.length ? existingThemeNames.join(', ') : '(none yet)'
  }

Return ONLY a JSON object with this exact shape, no markdown fences, no extra text:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": number between -1 and 1,
  "themes": array of 1-2 theme name strings (reuse existing ones where they fit),
  "featureArea": short string naming the product area this relates to,
  "rationale": one short sentence explaining the classification
}`
}

function stripMarkdownFences(text: string): string {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no text content')
  return text
}

export async function classifyFeedback(
  content: string,
  existingThemeNames: string[],
): Promise<Classification> {
  const prompt = buildPrompt(content, existingThemeNames)

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callGemini(prompt)
      const cleaned = stripMarkdownFences(raw)
      const parsed = classificationSchema.safeParse(JSON.parse(cleaned))
      if (parsed.success) return parsed.data
      console.error('Classification validation failed:', parsed.error.flatten())
    } catch (err) {
      console.error(`Classification attempt ${attempt + 1} failed:`, err)
    }
  }

  throw new Error('Classification failed after retry')
}