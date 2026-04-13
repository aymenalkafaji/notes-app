import { redis } from '@/lib/redis'
import { getUserColor } from '@/lib/presence'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { cursor, name, userId: guestId, anchor, head } = await req.json()

  const userId = guestId ?? 'guest'

  const existing = await redis.get(`presence:${id}:${userId}`)
  const prev = existing ? JSON.parse(existing) : {}

  const user = {
    id: userId,
    name: name ?? 'Guest',
    color: getUserColor(userId),
    cursor,
    anchor: anchor ?? prev.anchor,
    head: head ?? prev.head,
    lastSeen: Date.now(),
  }

  const key = `presence:${id}:${userId}`
  await redis.setex(key, 15, JSON.stringify(user))

  const allKeys = await redis.keys(`presence:${id}:*`)
  const allUsers = await Promise.all(allKeys.map(k => redis.get(k)))
  const users = allUsers.filter(Boolean).map(u => JSON.parse(u!))

  await redis.publish(`presence:${id}`, JSON.stringify({ type: 'presence', users }))

  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const userId = body.userId ?? 'guest'
  await redis.del(`presence:${id}:${userId}`)
  return Response.json({ ok: true })
}