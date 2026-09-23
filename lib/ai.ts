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

// --- Embeddings + Ask LOOP (retrieval-grounded Q&A) ---

const EMBEDDING_MODEL = 'gemini-embedding-001'
const EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const res = await fetch(`${EMBEDDING_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini embedding error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const values = data?.embedding?.values
  if (!Array.isArray(values)) throw new Error('Gemini returned no embedding values')
  return values
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export interface GroundedAnswer {
  answer: string
  usedFeedbackIds: string[]
}

export async function answerFromFeedback(
  question: string,
  relevantItems: Array<{ id: string; content: string }>,
): Promise<GroundedAnswer> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  if (relevantItems.length === 0) {
    return {
      answer: "I couldn't find any feedback related to that question.",
      usedFeedbackIds: [],
    }
  }

  const context = relevantItems
    .map((item, i) => `[${i + 1}] (id: ${item.id}) ${item.content}`)
    .join('\n')

  const prompt = `You are answering a question using ONLY the customer feedback provided below. Do not invent or assume anything not present in this feedback. If the feedback doesn't actually answer the question, say so honestly.

Feedback items:
${context}

Question: ${question}

Answer in 2-4 sentences, referencing specific feedback items by their [number] where relevant.`

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no text content')

  return {
    answer: text.trim(),
    usedFeedbackIds: relevantItems.map((item) => item.id),
  }
}

// --- Voice-of-Customer report generation ---

export interface ReportStats {
  periodLabel: string
  totalItems: number
  sentimentBreakdown: { POS: number; NEU: number; NEG: number }
  topThemes: Array<{ name: string; count: number }>
  sampleQuotes: string[]
}

export async function generateReportNarrative(stats: ReportStats): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const prompt = `Write a Voice-of-Customer report narrative for a product team, based ONLY on the
real numbers and quotes below. Do not invent any statistics, themes, or quotes not listed here.

Period: ${stats.periodLabel}
Total feedback items: ${stats.totalItems}
Sentiment breakdown: ${stats.sentimentBreakdown.POS} positive, ${stats.sentimentBreakdown.NEU} neutral, ${stats.sentimentBreakdown.NEG} negative
Top themes: ${stats.topThemes.map((t) => `${t.name} (${t.count} items)`).join(', ') || 'none'}
Sample verbatim quotes: ${stats.sampleQuotes.map((q) => `"${q}"`).join(' | ') || 'none'}

Write a concise report (4-6 short paragraphs) covering: an executive summary, the top themes and what
they mean, sentiment shifts, 1-2 notable verbatim quotes, and 2-3 recommended actions for the product
team. Plain prose, no markdown headers needed. Sound like a product analyst, not a hype machine.`

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no text content')
  return text.trim()
}