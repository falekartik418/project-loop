// lib/search.ts
// Semantic search for Ask LOOP.
//
// The question is embedded with Gemini.
// Feedback embeddings are compared using cosine similarity.
// Results are always restricted to the user's workspace.

import { db } from '@/lib/db'
import { generateEmbedding } from '@/lib/embeddings'

export type SearchResult = {
  id: string
  content: string
  channel: string
  customerLabel: string | null
  sentiment: string | null
  sentimentScore: number | null
  createdAt: Date
  similarity: number
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions do not match')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}

export async function semanticSearch(
  question: string,
  workspaceId: string,
  topK = 8,
): Promise<SearchResult[]> {
  const cleanedQuestion = question.trim()

  if (!cleanedQuestion) {
    throw new Error('Search question cannot be empty')
  }

  const questionEmbedding = await generateEmbedding(cleanedQuestion)

  const feedbackWithEmbeddings = await db.feedback.findMany({
    where: {
      workspaceId,
      embedding: {
        isNot: null,
      },
    },
    include: {
      embedding: true,
    },
  })

  const results: SearchResult[] = []

  for (const feedback of feedbackWithEmbeddings) {
    if (!feedback.embedding) {
      continue
    }

    const similarity = cosineSimilarity(
      questionEmbedding,
      feedback.embedding.vector,
    )

    results.push({
      id: feedback.id,
      content: feedback.content,
      channel: feedback.channel,
      customerLabel: feedback.customerLabel,
      sentiment: feedback.sentiment,
      sentimentScore: feedback.sentimentScore,
      createdAt: feedback.createdAt,
      similarity,
    })
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}