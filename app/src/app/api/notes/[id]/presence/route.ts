// app/api/notes/[id]/presence/route.ts
import { auth } from '@/lib/auth/config'
import { redis } from '@/lib/redis'
import { getUserColor } from '@/lib/presence'
import type { PresenceUser } from '@/lib/presence'

const PRESENCE_TTL = 15 // seconds

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const { cursor } = await req.json()
  const userId = session?.user?.id ?? req.headers.get('x-guest-id') ?? 'guest'
  const name = session?.user?.name ?? 'Guest'
  const image = session?.user?.image ?? null

  const user: PresenceUser = {
    id: userId,
    name,
    image,
    color: getUserColor(userId),
    cursor,
    lastSeen: Date.now(),
  }

  const key = `presence:${id}:${userId}`
  await redis.setex(key, PRESENCE_TTL, JSON.stringify(user))

  const allKeys = await redis.keys(`presence:${id}:*`)
  const allUsers = await Promise.all(allKeys.map(k => redis.get(k)))
  const users = allUsers.filter(Boolean).map(u => JSON.parse(u!))

  await redis.publish(`presence:${id}`, JSON.stringify({ type: 'presence', users }))

  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id ?? 'guest'
  await redis.del(`presence:${id}:${userId}`)
  return Response.json({ ok: true })
}
