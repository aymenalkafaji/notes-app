'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { CursorUser } from './CollabCursor'

export interface PresenceUser {
  id: string
  name: string
  initials: string
  color: string
  anchor?: number
  head?: number
  lastSeen: number
}

const COLORS = ['#C07840','#A06848','#7A6050','#8C7A5A','#6A8068','#7A6880','#A07858','#8A7048']

function getColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]!
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function PresenceAvatars({ noteId, currentUser, onCursorUpdate }: {
  noteId: string
  currentUser: { id: string; name: string } | null
  onCursorUpdate?: (users: CursorUser[]) => void
}) {
  const [others, setOthers] = useState<PresenceUser[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const myIdRef = useRef(currentUser?.id)

  const sendPresence = useCallback(async (anchor?: number, head?: number) => {
    if (!currentUser) return
    const body: Record<string, unknown> = { name: currentUser.name, userId: currentUser.id }
    if (anchor != null && head != null) { body.anchor = anchor; body.head = head }
    await fetch(`/api/notes/${noteId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  }, [noteId, currentUser])

  useEffect(() => {
    myIdRef.current = currentUser?.id
  }, [currentUser?.id])

  useEffect(() => {
    if (!noteId) return

    esRef.current = new EventSource(`/api/notes/${noteId}/presence/stream`)
    esRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'presence') {
          const otherUsers = (data.users as any[])
            .filter(u => u.id !== myIdRef.current)
            .map(u => ({
              ...u,
              color: getColor(u.id),
              initials: getInitials(u.name || 'User'),
            }))
          setOthers(otherUsers)

          // Update text cursors in editor
          const cursorUsers = otherUsers
            .filter(u => u.anchor != null && u.head != null)
            .map(u => ({
              id: u.id,
              name: u.name,
              color: u.color,
              anchor: u.anchor as number,
              head: u.head as number,
            }))
          window.dispatchEvent(new CustomEvent('collab-cursor-update', { detail: { noteId, users: cursorUsers } }))
          onCursorUpdate?.(cursorUsers)
        }
      } catch {}
    }

    sendPresence()
    heartbeatRef.current = setInterval(() => sendPresence(), 60_000)

    const handleLeave = () => {
      fetch(`/api/notes/${noteId}/presence`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      }).catch(() => {})
    }
    window.addEventListener('beforeunload', handleLeave)

    return () => {
      esRef.current?.close()
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      window.removeEventListener('beforeunload', handleLeave)
      // Do NOT call handleLeave here — navigating to another note should not
      // clear presence. The 30-min TTL handles inactivity expiry.
    }
  }, [noteId, sendPresence, onCursorUpdate])

  if (others.length === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {others.map((user, i) => (
        <div key={user.id}
          style={{ position: 'relative', marginLeft: i > 0 ? -8 : 0, zIndex: others.length - i }}
          onMouseEnter={() => setHoveredId(user.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: user.color,
            border: '2px solid var(--glass-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
            cursor: 'default',
            transition: 'transform 0.15s',
            transform: hoveredId === user.id ? 'scale(1.2) translateY(-2px)' : 'scale(1)',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {user.initials}
          </div>
          {hoveredId === user.id && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
              background: user.color, color: '#fff',
              fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 8,
              whiteSpace: 'nowrap', zIndex: 1000, pointerEvents: 'none',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              {user.name}
              <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `4px solid ${user.color}` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function CurrentUserBubble({ name, onChangeName }: { name: string; onChangeName: () => void }) {
  const [hov, setHov] = useState(false)
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
      <div
        style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--active-bg)', border: '2.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--active-text)', flexShrink: 0, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px var(--accent-glow)' }}
        title={name}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>{name}</div>
        <button
          onClick={onChangeName}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{ fontSize: 10, color: hov ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif', transition: 'color 0.15s' }}
        >
          Change name
        </button>
      </div>
    </div>
  )
}

export function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div style={{ background: 'var(--glass-bg-strong)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: '40px 36px', minWidth: 340, boxShadow: 'var(--glass-shadow-lg)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'Fraunces, Georgia, serif', color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Note<span style={{ color: 'var(--accent)' }}>wise</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, fontFamily: 'DM Sans, sans-serif' }}>Collaborate. Think. Create.</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>What should we call you?</div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()) }}
          placeholder="Your name"
          autoFocus
          style={{ width: '100%', padding: '13px 16px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 14, fontSize: 15, color: 'var(--text-primary)', outline: 'none', fontFamily: 'DM Sans, sans-serif', marginBottom: 12, textAlign: 'center', boxSizing: 'border-box' }}
        />
        <button
          onClick={() => { if (name.trim()) onSubmit(name.trim()) }}
          style={{ width: '100%', padding: '13px', background: 'var(--accent)', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, color: 'var(--accent-text)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', boxShadow: '0 4px 16px var(--accent-glow)' }}
          onMouseEnter={e => { (e.currentTarget.style.background = 'var(--accent-hover)'); (e.currentTarget.style.transform = 'translateY(-1px)') }}
          onMouseLeave={e => { (e.currentTarget.style.background = 'var(--accent)'); (e.currentTarget.style.transform = 'none') }}
        >
          Start writing →
        </button>
      </div>
    </div>
  )
}
