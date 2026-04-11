import { db } from '../client'
import { notes } from '../schema'
import { eq, desc, and } from 'drizzle-orm'

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
