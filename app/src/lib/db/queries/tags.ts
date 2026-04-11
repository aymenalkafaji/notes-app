import { db } from '../client'
import { tags, noteTags } from '../schema'
import { eq } from 'drizzle-orm'

export async function getTagsByUser(userId: string) {
  return db.select().from(tags).where(eq(tags.userId, userId))
}

export async function createTag(userId: string, name: string, color?: string) {
  const [tag] = await db.insert(tags).values({ userId, name, color }).returning()
  return tag!
}

export async function addTagToNote(noteId: string, tagId: string) {
  await db.insert(noteTags).values({ noteId, tagId }).onConflictDoNothing()
}
