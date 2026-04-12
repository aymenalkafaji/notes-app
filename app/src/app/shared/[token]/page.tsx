// app/shared/[token]/page.tsx
import { getShareLink } from '@/lib/db/queries/notes'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db/client'
import { notes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { SharedNoteClient } from '@/components/shared/SharedNoteClient'

export default async function SharedNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const link = await getShareLink(token)
  if (!link) notFound()
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) notFound()

  const [note] = await db.select().from(notes).where(eq(notes.id, link.noteId))
  if (!note) notFound()

  const session = await auth()

  return (
    <SharedNoteClient
      note={note}
      token={token}
      permission={link.permission as 'view' | 'edit'}
      currentUser={session?.user ?? null}
    />
  )
}
