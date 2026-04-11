import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'
import { db } from '@/lib/db/client'
import { notes } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('http://host.docker.internal:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  })
  const data = await res.json()
  return data.embedding
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { noteId, content } = await req.json()
  if (!noteId || !content?.trim()) return errorResponse('noteId and content required')

  const embedding = await getEmbedding(content)

  await db.update(notes)
    .set({
      contentText: content,
      embedding: sql`${JSON.stringify(embedding)}::vector`,
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, session!.user.id!)))

  return Response.json({ data: { success: true } })
}