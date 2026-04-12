import { requireAuth } from '@/lib/auth/guards'
import { getNoteById, updateNote, deleteNote } from '@/lib/db/queries'
import { UpdateNoteSchema } from '@/lib/validations/notes'
import { successResponse, errorResponse } from '@/lib/utils/api'
import { publishNoteUpdate } from '@/lib/redis'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const note = await getNoteById(params.id, session!.user.id)
  if (!note) return errorResponse('Note not found', 404)
  return successResponse(note)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = UpdateNoteSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.message)

  const updateData: any = { ...parsed.data, updatedAt: new Date() }

  if (parsed.data.content) {
    updateData.contentText = extractText(parsed.data.content as any)
  }

  const note = await updateNote(id, session!.user.id!, updateData)
  if (!note) return errorResponse('Note not found', 404)
    console.log('Publishing update for note:', id)

  await publishNoteUpdate(id, { title: note.title, content: note.content, updatedAt: note.updatedAt })
  return successResponse(note)
}

function extractText(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  const texts: string[] = []
  if (content.content) {
    for (const node of content.content) {
      texts.push(extractText(node))
    }
  }
  if (content.text) texts.push(content.text)
  return texts.join(' ').trim()
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  await deleteNote(params.id, session!.user.id)
  return successResponse({ deleted: true })
}
