// lib/search.ts
// Semantic search for Ask LOOP.
//
// The question is embedded with Gemini.
// Feedback embeddings are compared using cosine similarity.
// Results are always restricted to the user's workspace.

import { db } from '@/lib/db'
import { embedText, cosineSimilarity } from '@/lib/ai'

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

export async function semanticSearch(
  question: string,
  workspaceId: string,
  topK = 8,
): Promise<SearchResult[]> {
  const cleanedQuestion = question.trim()

  if (!cleanedQuestion) {
    throw new Error('Search question cannot be empty')
  }

  const questionEmbedding = await embedText(cleanedQuestion)

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