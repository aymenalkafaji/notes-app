import { getShareLink } from '@/lib/db/queries/notes'
import { db } from '@/lib/db/client'
import { notes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { successResponse, errorResponse } from '@/lib/utils/api'
import { publishNoteUpdate } from '@/lib/redis'

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const link = await getShareLink(token)

  if (!link) return errorResponse('Invalid link', 404)
  if (link.permission !== 'edit') return errorResponse('View only', 403)
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return errorResponse('Link expired', 403)

  const body = await req.json()

  const [note] = await db.update(notes)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(notes.id, link.noteId))
    .returning()
  await publishNoteUpdate(link.noteId, { title: note.title, content: note.content, updatedAt: note.updatedAt })
  return successResponse(note)
}