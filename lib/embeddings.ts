import { GoogleGenAI } from '@google/genai'

const EMBEDDING_MODEL = 'gemini-embedding-2'
const EMBEDDING_DIMENSIONS = 768

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  return new GoogleGenAI({ apiKey })
}

export async function generateEmbedding(
  text: string,
): Promise<number[]> {
  const cleanedText = text.trim()

  if (!cleanedText) {
    throw new Error('Cannot generate an embedding for empty text')
  }

  const ai = getAIClient()

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: cleanedText,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  })

  const embedding = response.embeddings?.[0]?.values

  if (!embedding || embedding.length === 0) {
    throw new Error('Gemini returned an empty embedding')
  }

  return embedding
}

export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return []
  }

  const ai = getAIClient()

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  })

  const embeddings =
    response.embeddings?.map(
      (embedding) => embedding.values ?? [],
    ) ?? []

  if (embeddings.length !== texts.length) {
    throw new Error(
      `Expected ${texts.length} embeddings but received ${embeddings.length}`,
    )
  }

  if (embeddings.some((embedding) => embedding.length === 0)) {
    throw new Error('Gemini returned an empty embedding')
  }

  return embeddings
}