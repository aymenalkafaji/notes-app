import { auth } from '@/lib/auth/config'
import { getNoteById } from '@/lib/db/queries'
import { redirect, notFound } from 'next/navigation'
import { NoteEditorClient } from '@/components/editor/NoteEditorClient'

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')
  const note = await getNoteById(id, session.user.id!)
  if (!note) notFound()
  return (
    <NoteEditorClient
      noteId={note.id}
      initialContent={note.content as object}
      initialTitle={note.title}
    />
  )
}
