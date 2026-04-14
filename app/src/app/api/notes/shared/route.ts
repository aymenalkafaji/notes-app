import { redis } from '@/lib/redis'
import { db } from '@/lib/db/client'
import { notes, shareLinks } from '@/lib/db/schema'
import { inArray, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Scan all active presence keys: presence:{noteId}:{userId}
    const keys = await redis.keys('presence:*')

    // Group by noteId, count distinct users
    const countByNote: Record<string, Set<string>> = {}
    for (const key of keys) {
      const parts = key.split(':')
      if (parts.length < 3) continue
      const noteId = parts[1]!
      const userId = parts.slice(2).join(':')
      if (!noteId) continue
      if (!countByNote[noteId]) countByNote[noteId] = new Set()
      countByNote[noteId]!.add(userId)
    }

    // Only notes with 2+ active users
    const activeNoteIds = Object.entries(countByNote)
      .filter(([, users]) => users.size >= 2)
      .map(([noteId]) => noteId)

    if (activeNoteIds.length === 0) return Response.json({ data: [] })

    // Fetch note metadata + first share token (if any)
    const noteRows = await db
      .select({ id: notes.id, title: notes.title, updatedAt: notes.updatedAt, token: shareLinks.token })
      .from(notes)
      .leftJoin(shareLinks, eq(shareLinks.noteId, notes.id))
      .where(inArray(notes.id, activeNoteIds))

    // Deduplicate by note id, keeping first token found
    const seen = new Set<string>()
    const data = noteRows
      .filter(n => { if (seen.has(n.id)) return false; seen.add(n.id); return true })
      .map(n => ({
        id: n.id,
        title: n.title,
        updatedAt: n.updatedAt,
        token: n.token ?? null,
        activeUsers: countByNote[n.id]?.size ?? 0,
      }))

    return Response.json({ data })
  } catch {
    return Response.json({ data: [] })
  }
}
