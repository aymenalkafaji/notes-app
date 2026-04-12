// lib/presence.ts
// Shared types for presence system
export interface PresenceUser {
  id: string
  name: string
  image?: string | null
  color: string
  cursor?: { x: number; y: number } | null
  lastSeen: number
}

const COLORS = [
  '#E85D04', '#7209B7', '#3A0CA3', '#4361EE',
  '#4CC9F0', '#06D6A0', '#F72585', '#B5179E'
]

export function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]!
}
