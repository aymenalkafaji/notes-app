import { pgTable, uuid, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Untitled'),
  content: jsonb('content'),
  contentText: text('content_text'),
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const noteLinks = pgTable('note_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceNoteId: uuid('source_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  targetNoteId: uuid('target_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const shareLinks = pgTable('share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  permission: text('permission').notNull().default('view'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
