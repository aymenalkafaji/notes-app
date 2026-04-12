'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { PresenceUser } from '@/lib/presence'

interface GhostCursor {
  user: PresenceUser
  x: number
  y: number
}

export function PresenceAvatars({ noteId, currentUser }: {
  noteId: string
  currentUser?: { id: string; name: string; image?: string | null } | null
}) {
  const [users, setUsers] = useState<PresenceUser[]>([])
  const [cursors, setCursors] = useState<GhostCursor[]>([])
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sendPresence = useCallback(async (cursor?: { x: number; y: number } | null) => {
    if (!currentUser) return
    await fetch(`/api/notes/${noteId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursor }),
    }).catch(() => {})
  }, [noteId, currentUser])

  useEffect(() => {
    if (!noteId) return

    esRef.current = new EventSource(`/api/notes/${noteId}/presence/stream`)
    esRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'presence') {
          const others = (data.users as PresenceUser[]).filter(u => u.id !== currentUser?.id)
          setUsers(others)
          setCursors(others
            .filter(u => u.cursor)
            .map(u => ({ user: u, x: u.cursor!.x, y: u.cursor!.y }))
          )
        }
      } catch {}
    }

    sendPresence()
    heartbeatRef.current = setInterval(() => sendPresence(), 5000)

    const handleMouseMove = (e: MouseEvent) => {
      sendPresence({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleLeave = () => sendPresence(null)
    window.addEventListener('beforeunload', handleLeave)

    return () => {
      esRef.current?.close()
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('beforeunload', handleLeave)
      handleLeave()
    }
  }, [noteId, currentUser, sendPresence])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {users.map((user, i) => (
          <div
            key={user.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredUser(user.id)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: user.color,
              border: `2px solid ${user.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              overflow: 'hidden', cursor: 'default',
              marginLeft: i > 0 ? -8 : 0,
              zIndex: users.length - i,
              position: 'relative',
              transition: 'transform 0.15s',
              transform: hoveredUser === user.id ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
            }}>
              {user.image
                ? <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              }
            </div>
            {hoveredUser === user.id && (
              <div style={{
                position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                background: user.color, color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap', zIndex: 1000,
                pointerEvents: 'none', marginTop: 4,
              }}>
                {user.name}
                <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: `4px solid ${user.color}` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {cursors.map(({ user, x, y }) => (
        <div key={user.id} style={{
          position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999,
          transform: 'translate(-2px, -2px)', transition: 'left 0.08s, top 0.08s',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 2L16 10L10 11L8 18L4 2Z" fill={user.color} stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <div style={{
            position: 'absolute', left: 16, top: 0,
            background: user.color, color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '2px 7px',
            borderRadius: '0 6px 6px 6px', whiteSpace: 'nowrap',
          }}>
            {user.name.split(' ')[0]}
          </div>
        </div>
      ))}
    </>
  )
}
