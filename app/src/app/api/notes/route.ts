import { requireAuth } from '@/lib/auth/guards'
import { getNotesByUser, createNote } from '@/lib/db/queries'
import { CreateNoteSchema } from '@/lib/validations/notes'
import { successResponse, errorResponse } from '@/lib/utils/api'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('http://host.docker.internal:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  })
  const data = await res.json()
  return data.embedding
}

export async function GET(req: Request) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (query) {
    try {
      const embedding = await getEmbedding(query)
      console.log('Got embedding, length:', embedding.length)

      const embeddingStr = JSON.stringify(embedding)

      const results = await db.execute(sql`
        SELECT id, title, updated_at, content_text,
        (embedding <=> ${embeddingStr}::vector) as score
        FROM notes
        WHERE user_id = ${session!.user.id!}::uuid
        AND is_archived = false
        AND embedding IS NOT NULL
        AND content_text IS NOT NULL
        AND (embedding <=> ${embeddingStr}::vector) < 0.55
        ORDER BY score ASC
        LIMIT 10
      `)

      const rows = Array.from(results)
      console.log('rows found:', rows.length)
      rows.forEach((r: any) => console.log(r.title, '→ score:', r.score))

      return successResponse(rows as any)
    } catch (err) {
      console.error('Search error:', err)
      return errorResponse('Search failed')
    }
  }

  const allNotes = await getNotesByUser(session!.user.id!)
  return successResponse(allNotes)
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = CreateNoteSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.message)

  const note = await createNote(session!.user.id!, parsed.data)
  return successResponse(note, 201)
}