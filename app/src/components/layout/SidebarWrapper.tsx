'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNotes } from '@/hooks/useNotes'
import { signOut, useSession } from 'next-auth/react'
import type { Note } from '@/types'

function NoteMenu({ note, onDelete, onPin, onClose }: {
  note: Note; onDelete: () => void; onPin: () => void; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 300, borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', minWidth: 180, overflow: 'hidden', marginTop: 6, padding: '4px 0', background: 'var(--glass-bg-strong)', backdropFilter: 'blur(32px) saturate(200%)', WebkitBackdropFilter: 'blur(32px) saturate(200%)', border: '1px solid var(--glass-border)' }}>
      {[
        { label: note.isPinned ? 'Unpin' : 'Pin to top', color: 'var(--text-secondary)', fn: onPin },
        { label: 'Delete', color: '#C04040', fn: onDelete },
      ].map(item => (
        <button key={item.label} onClick={(e) => { e.stopPropagation(); item.fn(); onClose() }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: item.color, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >{item.label}</button>
      ))}
    </div>
  )
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { createNote } = useNotes()
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [dark, setDark] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'light'
    document.documentElement.setAttribute('data-theme', saved)
    setDark(saved === 'dark')
  }, [])

  useEffect(() => {
    function handler(e: Event) {
      const { noteId, title } = (e as CustomEvent).detail
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, title } : n))
    }
    window.addEventListener('note-title-changed', handler)
    return () => window.removeEventListener('note-title-changed', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/notes')
    const { data } = await res.json()
    setNotes(data ?? [])
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes, pathname])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleNewNote() {
    const note = await createNote()
    await fetchNotes()
    router.push(`/notes/${note.id}`)
  }

  async function handleSearch(q: string) {
    setQuery(q)
    if (!q.trim()) { setSearchResults(null); fetchNotes(); return }
    setSearching(true)
    const res = await fetch(`/api/notes?q=${encodeURIComponent(q)}`)
    const { data } = await res.json()
    setSearchResults(data ?? [])
    setSearching(false)
  }

  async function handleDelete(noteId: string) {
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
    if (pathname === `/notes/${noteId}`) router.push('/notes')
    fetchNotes()
  }

  async function handlePin(note: Note) {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !note.isPinned }),
    })
    fetchNotes()
  }

  const displayNotes = searchResults ?? notes
  const pinned = displayNotes.filter(n => n.isPinned)
  const unpinned = displayNotes.filter(n => !n.isPinned)
  const name = session?.user?.name ?? 'User'
  const email = session?.user?.email ?? ''
  const image = session?.user?.image
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const glassStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow-lg)',
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', zIndex: 1, gap: 12, padding: 12, minHeight: 0, background: 'transparent' }}>

      {/* SIDEBAR ISLAND */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, transition: 'width 0.35s cubic-bezier(0.34,1.2,0.64,1)', width: collapsed ? 56 : 290, overflow: 'hidden' }}>

        {/* Logo + collapse island */}
        <div style={{ ...glassStyle, borderRadius: 20, padding: collapsed ? '14px 12px' : '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between', flexShrink: 0 }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Fraunces, Georgia, serif', letterSpacing: '-0.4px', lineHeight: 1 }}>
                Note<span style={{ color: 'var(--accent)' }}>wise</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>AI Notes</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.3s' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
              <polyline points="9,3 5,7 9,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
        </div>

        {!collapsed && (
          <>
            {/* New note island */}
            <button onClick={handleNewNote}
              style={{ ...glassStyle, borderRadius: 16, padding: '12px 16px', border: '1px solid var(--active-border)', background: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif', flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--active-bg)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              New note
            </button>

            {/* Search island */}
            <div style={{ ...glassStyle, borderRadius: 16, padding: '10px 12px', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <input type="text" value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search..."
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: '4px 8px 4px 28px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                />
                <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Notes list island */}
            <div style={{ ...glassStyle, borderRadius: 20, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
                {displayNotes.length === 0 ? (
                  <div style={{ padding: '24px 12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
                    {query ? 'No results' : 'No notes yet'}
                  </div>
                ) : (
                  <>
                    {pinned.length > 0 && (
                      <>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, padding: '8px 10px 4px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>Pinned</div>
                        {pinned.map(note => renderNote(note))}
                      </>
                    )}
                    {unpinned.length > 0 && (
                      <>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, padding: '8px 10px 4px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>{pinned.length > 0 ? 'Recent' : 'Notes'}</div>
                        {unpinned.map(note => renderNote(note))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* User island */}
            <div ref={userRef} style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ ...glassStyle, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => setShowUserMenu(v => !v)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg-strong)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--active-bg)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--active-text)', overflow: 'hidden', flexShrink: 0 }}>
                  {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>

              {showUserMenu && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 300, borderRadius: 16, overflow: 'hidden', background: 'var(--glass-bg-strong)', backdropFilter: 'blur(32px) saturate(200%)', WebkitBackdropFilter: 'blur(32px) saturate(200%)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow-lg)', padding: '6px 0' }}>
                  <button onClick={toggleDark}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{dark ? '☀️' : '🌙'}</span>
                      {dark ? 'Light mode' : 'Dark mode'}
                    </span>
                    <div style={{ width: 34, height: 20, borderRadius: 10, background: dark ? 'var(--accent)' : 'var(--border-strong)', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 3, left: dark ? 17 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }} />
                    </div>
                  </button>
                  <div style={{ height: '0.5px', background: 'var(--border)', margin: '2px 0' }} />
                  <button onClick={() => signOut({ callbackUrl: '/login' })}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#C04040', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="10" y1="7.5" x2="14" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><polyline points="12,5.5 14,7.5 12,9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Collapsed state: just icons */}
        {collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <button onClick={handleNewNote} style={{ ...glassStyle, borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--active-border)', background: 'var(--accent-light)', cursor: 'pointer', color: 'var(--accent)' }} title="New note">
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div style={{ ...glassStyle, borderRadius: 14, width: 44, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 4, overflowY: 'auto' }}>
              {displayNotes.slice(0, 8).map(note => {
                const isActive = pathname === `/notes/${note.id}`
                return (
                  <button key={note.id} onClick={() => router.push(`/notes/${note.id}`)}
                    title={note.title || 'Untitled'}
                    style={{ width: 32, height: 32, borderRadius: 10, background: isActive ? 'var(--active-bg)' : 'transparent', border: isActive ? '1px solid var(--active-border)' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isActive ? 'var(--active-text)' : 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {(note.title || 'U')[0].toUpperCase()}
                  </button>
                )
              })}
            </div>
            <div style={{ ...glassStyle, borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setShowUserMenu(v => !v)}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--active-bg)', border: '1.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--active-text)', overflow: 'hidden' }}>
                {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, overflow: 'hidden', minHeight: 0, background: 'transparent' }}>
        {children}
      </div>
    </div>
  )

  function renderNote(note: Note) {
    const isActive = pathname === `/notes/${note.id}`
    const isMenuOpen = menuNoteId === note.id
    return (
      <div key={note.id} style={{ position: 'relative', borderRadius: 12, background: isActive ? 'var(--active-bg)' : 'transparent', margin: '1px 0', border: isActive ? '1px solid var(--active-border)' : '1px solid transparent', transition: 'all 0.15s' }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--hover)' }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div onClick={() => router.push(`/notes/${note.id}`)} style={{ padding: '9px 34px 9px 12px', cursor: 'pointer', userSelect: 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? 'var(--active-text)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Sans, sans-serif' }}>
            {note.isPinned && <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}><path d="M8.5 1.5L12.5 5.5L9 7L7 12L5.5 8.5L1.5 7L6.5 5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>}
            {note.title || 'Untitled'}
          </div>
          <div style={{ fontSize: 11, color: isActive ? 'var(--active-sub)' : 'var(--text-muted)', marginTop: 2 }}>
            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setMenuNoteId(isMenuOpen ? null : note.id) }}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: 5, fontSize: 14, lineHeight: 1, opacity: 0.5 }}
        >···</button>
        {isMenuOpen && <NoteMenu note={note} onDelete={() => handleDelete(note.id)} onPin={() => handlePin(note)} onClose={() => setMenuNoteId(null)} />}
      </div>
    )
  }
}
