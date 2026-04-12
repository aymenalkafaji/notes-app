import { db } from '../client'
import { notes } from '../schema'
import { eq, desc, and } from 'drizzle-orm'
import { shareLinks } from '../schema'

export async function getNotesByUser(userId: string) {
  return db.select().from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.isArchived, false)))
    .orderBy(desc(notes.updatedAt))
}

export async function getNoteById(id: string, userId: string) {
  const [note] = await db.select().from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
  return note ?? null
}

export async function createNote(userId: string, data?: { title?: string; content?: object }) {
  const [note] = await db.insert(notes)
    .values({ userId, title: data?.title ?? 'Untitled', content: data?.content })
    .returning()
  return note!
}

export async function updateNote(id: string, userId: string, data: Partial<typeof notes.$inferInsert>) {
  const [note] = await db.update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning()
  return note ?? null
}

export async function deleteNote(id: string, userId: string) {
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
}
export async function createShareLink(noteId: string, permission: 'view' | 'edit', expiresAt?: Date) {
  const { nanoid } = await import('nanoid')
  const token = nanoid(12)
  const [link] = await db.insert(shareLinks).values({ noteId, token, permission, expiresAt }).returning()
  return link!
}

export async function getShareLink(token: string) {
  const [link] = await db.select().from(shareLinks).where(eq(shareLinks.token, token))
  return link ?? null
}

export async function deleteShareLink(id: string) {
  await db.delete(shareLinks).where(eq(shareLinks.id, id))
}

export async function getShareLinksByNote(noteId: string) {
  return db.select().from(shareLinks).where(eq(shareLinks.noteId, noteId))
}
