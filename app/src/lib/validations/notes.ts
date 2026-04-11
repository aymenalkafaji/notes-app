import { z } from 'zod'

export const CreateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.record(z.unknown()).optional(),
})

export const UpdateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.record(z.unknown()).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
})

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>
