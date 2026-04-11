import type { notes, tags } from '@/lib/db/schema'

export type Note = typeof notes.$inferSelect
export type NoteInsert = typeof notes.$inferInsert
export type Tag = typeof tags.$inferSelect

export type NoteWithTags = Note & { tags: Tag[] }

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}
