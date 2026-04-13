'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNotes } from '@/hooks/useNotes'
import type { Note } from '@/types'
import { PresenceAvatars, CurrentUserBubble } from '@/components/editor/PresenceAvatars'

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

function AIDropdown({ onSummarize, onQuiz, onRewrite, summarizing, quizLoading }: {
  onSummarize: () => void; onQuiz: () => void; onRewrite: (style: string) => void
  summarizing: boolean; quizLoading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [showRewriteMenu, setShowRewriteMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setShowRewriteMenu(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 44, height: 44, borderRadius: 14, background: open ? 'var(--active-bg)' : 'var(--hover)', border: `1px solid ${open ? 'var(--active-border)' : 'var(--border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: open ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.2s', flexShrink: 0 }}
        title="AI tools"
      >
        {/* Brain/AI icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 3C5.3 3 4 4.3 4 6c0 .8.3 1.5.8 2C3.7 8.5 3 9.7 3 11c0 1.9 1.3 3.5 3 3.9V16h8v-1.1c1.7-.4 3-2 3-3.9 0-1.3-.7-2.5-1.8-3 .5-.5.8-1.2.8-2 0-1.7-1.3-3-3-3-1 0-1.8.5-2.3 1.2C11 4.5 10.1 4 9 4c-.7 0-1.4.3-1.8.8C6.8 4.3 6.4 4 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="7" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="10" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="13" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 9999, background: 'var(--glass-bg-strong)', backdropFilter: 'blur(32px) saturate(200%)', WebkitBackdropFilter: 'blur(32px) saturate(200%)', border: '1px solid var(--glass-border)', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.2)', minWidth: 220, padding: '8px 0' }}>
          <div style={{ padding: '6px 14px 8px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>AI Assist</div>

          <button onClick={() => { window.dispatchEvent(new CustomEvent('ai-summarize')); setOpen(false) }} disabled={summarizing}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4h11M2 7h8M2 10h9M2 13h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            {summarizing ? 'Summarizing...' : 'Summarize note'}
          </button>

          <button onClick={() => { window.dispatchEvent(new CustomEvent('ai-quiz')); setOpen(false) }} disabled={quizLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 1.5-1 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="11" r=".8" fill="currentColor"/></svg>
            {quizLoading ? 'Generating...' : 'Quiz me'}
          </button>

          <div style={{ height: '0.5px', background: 'var(--border)', margin: '4px 0' }} />

          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowRewriteMenu(s => !s)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: showRewriteMenu ? 'var(--hover)' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseLeave={e => { if (!showRewriteMenu) e.currentTarget.style.background = 'none' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 12L5 9M5 9L11 3L13 5L7 11L5 9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 2l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                Rewrite & Organize
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▶</span>
            </button>

            {showRewriteMenu && (
              <div style={{ position: 'absolute', left: 'calc(100% + 4px)', top: 0, zIndex: 9999, background: 'var(--glass-bg-strong)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid var(--glass-border)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: 180, padding: '6px 0' }}>
                {[
                  { key: 'professional', label: '💼 Professional' },
                  { key: 'casual', label: '😊 Casual' },
                  { key: 'concise', label: '✂️ Concise' },
                  { key: 'detailed', label: '📖 Detailed' },
                  { key: 'bullet', label: '• Bullet points' },
                ].map(s => (
                  <button key={s.key} onClick={() => { window.dispatchEvent(new CustomEvent('ai-rewrite', { detail: { style: s.key } })); setOpen(false); setShowRewriteMenu(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >{s.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface SidebarWrapperProps {
  children: React.ReactNode
  onSummarize?: () => void
  onQuiz?: () => void
  onRewrite?: (style: string) => void
  summarizing?: boolean
  quizLoading?: boolean
  presenceSlot?: React.ReactNode
  currentUserSlot?: React.ReactNode
}

export function SidebarWrapper({ children, onSummarize, onQuiz, onRewrite, summarizing = false, quizLoading = false, presenceSlot, currentUserSlot }: SidebarWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { createNote } = useNotes()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const currentNoteId = pathname.startsWith('/notes/') ? pathname.split('/notes/')[1] ?? null : null
  const [localUser, setLocalUser] = useState<{ id: string; name: string } | null>(null)
  useEffect(() => {
    const load = () => {
      const name = localStorage.getItem('notewise-name')
      const id = localStorage.getItem('notewise-uid')
      if (name && id) setLocalUser({ id, name })
    }
    load()
    window.addEventListener('presence-info', load)
    return () => window.removeEventListener('presence-info', load)
  }, [])
  useEffect(() => {
    const load = () => {
      const name = localStorage.getItem('notewise-name')
      const id = localStorage.getItem('notewise-uid')
      if (name && id) setLocalUser({ id, name })
    }
    load()
    window.addEventListener('presence-info', load)
    return () => window.removeEventListener('presence-info', load)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'light'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  useEffect(() => {
    function handler(e: Event) {
      const { noteId, title } = (e as CustomEvent).detail
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, title } : n))
    }
    window.addEventListener('note-title-changed', handler)
    return () => window.removeEventListener('note-title-changed', handler)
  }, [])

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/notes')
    const { data } = await res.json()
    setNotes(data ?? [])
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes, pathname])

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

  const glassStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow-lg)',
  }

  const renderNote = (note: Note) => {
    const isActive = pathname === `/notes/${note.id}`
    const isMenuOpen = menuNoteId === note.id
    return (
      <div key={note.id} style={{ position: 'relative', borderRadius: 12, background: isActive ? 'var(--active-bg)' : 'transparent', margin: '1px 0', border: isActive ? '1px solid var(--active-border)' : '1px solid transparent', transition: 'all 0.15s' }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--hover)' }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div onClick={() => router.push(`/notes/${note.id}`)} style={{ padding: '9px 40px 9px 12px', cursor: 'pointer', userSelect: 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? 'var(--active-text)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Sans, sans-serif' }}>
            {note.isPinned && <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}><path d="M8.5 1.5L12.5 5.5L9 7L7 12L5.5 8.5L1.5 7L6.5 5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>}
            {note.title || 'Untitled'}
          </div>
          <div style={{ fontSize: 11, color: isActive ? 'var(--active-sub)' : 'var(--text-muted)', marginTop: 2 }}>
            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setMenuNoteId(isMenuOpen ? null : note.id) }}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: isMenuOpen ? 'var(--hover)' : 'rgba(100,80,60,0.1)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '3px 7px', borderRadius: 7, fontSize: 14, lineHeight: 1, letterSpacing: '1px', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget.style.background = 'var(--hover)'); (e.currentTarget.style.color = 'var(--text-primary)') }}
          onMouseLeave={e => { (e.currentTarget.style.background = isMenuOpen ? 'var(--hover)' : 'rgba(100,80,60,0.1)'); (e.currentTarget.style.color = 'var(--text-secondary)') }}
        >···</button>
        {isMenuOpen && <NoteMenu note={note} onDelete={() => handleDelete(note.id)} onPin={() => handlePin(note)} onClose={() => setMenuNoteId(null)} />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', zIndex: 1, gap: 10, padding: 10, background: 'transparent', minHeight: 0 }}>

      {/* SIDEBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, transition: 'width 0.35s cubic-bezier(0.34,1.2,0.64,1)', width: collapsed ? 56 : 290, overflow: 'visible', position: 'relative', zIndex: 100 }}>

        {/* TOP ACTION ISLAND */}
        <div style={{ ...glassStyle, borderRadius: 20, height: 56, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, overflow: 'visible', position: 'relative', zIndex: 100 }}>
          {!collapsed ? (
            <>
              <button onClick={handleNewNote}
                style={{ flex: 1, height: 38, background: 'var(--accent-light)', border: '1px solid var(--active-border)', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget.style.background = 'var(--active-bg)'); (e.currentTarget.style.transform = 'translateY(-1px)') }}
                onMouseLeave={e => { (e.currentTarget.style.background = 'var(--accent-light)'); (e.currentTarget.style.transform = 'none') }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                New note
              </button>
              <AIDropdown onSummarize={onSummarize ?? (() => {})} onQuiz={onQuiz ?? (() => {})} onRewrite={onRewrite ?? (() => {})} summarizing={summarizing} quizLoading={quizLoading} />
              <button onClick={() => setCollapsed(true)}
                style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="8,2 4,6 8,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              </button>
            </>
          ) : (
            <button onClick={() => setCollapsed(false)}
              style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--hover)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </button>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Search */}
            <div style={{ ...glassStyle, borderRadius: 16, padding: '8px 12px', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <input type="text" value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search notes..."
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: '4px 8px 4px 28px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                />
                <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {searching && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Searching...</div>}
            </div>

            {/* Notes list */}
            <div style={{ ...glassStyle, borderRadius: 20, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
                {displayNotes.length === 0 ? (
                  <div style={{ padding: '24px 12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
                    {query ? 'No results' : 'No notes yet'}
                  </div>
                ) : (
                  <>
                    {pinned.length > 0 && <><div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, padding: '8px 10px 4px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>Pinned</div>{pinned.map(renderNote)}</>}
                    {unpinned.length > 0 && <><div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, padding: '8px 10px 4px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>{pinned.length > 0 ? 'Recent' : 'Notes'}</div>{unpinned.map(renderNote)}</>}
                  </>
                )}
              </div>
            </div>

            {/* User island: current user + active presence */}
            <div style={{ ...glassStyle, borderRadius: 16, padding: '8px 12px', display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {localUser && <CurrentUserBubble name={localUser.name} onChangeName={() => {
                  localStorage.removeItem('notewise-name')
                  window.location.reload()
                }} />}
              </div>
              {currentNoteId && localUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 1, height: 28, background: 'var(--border)', opacity: 0.4, marginLeft: 8 }} />
                  <PresenceAvatars noteId={currentNoteId} currentUser={localUser} />
                </div>
              )}
            </div>
          </>
        )}

        {collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <button onClick={handleNewNote} style={{ ...glassStyle, borderRadius: 14, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--active-border)', background: 'var(--accent-light)', cursor: 'pointer', color: 'var(--accent)' }} title="New note">
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div style={{ ...glassStyle, borderRadius: 14, width: 44, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 4, overflowY: 'auto' }}>
              {displayNotes.slice(0, 8).map(note => {
                const isActive = pathname === `/notes/${note.id}`
                return (
                  <button key={note.id} onClick={() => router.push(`/notes/${note.id}`)} title={note.title || 'Untitled'}
                    style={{ width: 32, height: 32, borderRadius: 10, background: isActive ? 'var(--active-bg)' : 'transparent', border: isActive ? '1px solid var(--active-border)' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isActive ? 'var(--active-text)' : 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}
                  >{(note.title || 'U')[0].toUpperCase()}</button>
                )
              })}
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
}
