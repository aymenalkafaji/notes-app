import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { notes } from './notes'

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#888780'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const noteTags = pgTable('note_tags', {
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})
