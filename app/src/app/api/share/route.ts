import { requireAuth } from '@/lib/auth/guards'
import { errorResponse, successResponse } from '@/lib/utils/api'
import { createShareLink, getShareLinksByNote, deleteShareLink } from '@/lib/db/queries/notes'
import { db } from '@/lib/db/client'
import { notes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: Request) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { noteId, permission = 'view' } = await req.json()
  if (!noteId) return errorResponse('noteId required')

  const [note] = await db.select().from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, session!.user.id!)))
  if (!note) return errorResponse('Note not found', 404)

  const link = await createShareLink(noteId, permission)
  return successResponse(link, 201)
}

export async function GET(req: Request) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const noteId = searchParams.get('noteId')
  if (!noteId) return errorResponse('noteId required')

  const links = await getShareLinksByNote(noteId)
  return successResponse(links)
}

export async function DELETE(req: Request) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { id } = await req.json()
  if (!id) return errorResponse('id required')

  await deleteShareLink(id)
  return successResponse({ deleted: true })
}