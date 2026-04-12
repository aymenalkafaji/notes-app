'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNotes } from '@/hooks/useNotes'
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
    <div ref={ref} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 200, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', minWidth: 180, overflow: 'hidden', marginTop: 4, padding: '4px 0' }}>
      {[
        { label: note.isPinned ? 'Unpin' : 'Pin to top', color: 'var(--text-secondary)', fn: onPin },
        { label: 'Delete note', color: '#B04040', fn: onDelete },
      ].map(item => (
        <button key={item.label} onClick={(e) => { e.stopPropagation(); item.fn(); onClose() }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: item.color, fontFamily: 'sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {item.label === 'Pin to top' || item.label === 'Unpin' ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5 }}>
              <path d="M8.5 1.5L12.5 5.5L9 7L7 12L5.5 8.5L1.5 7L6.5 5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <line x1="5.5" y1="8.5" x2="2" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
              <polyline points="3,3 11,3 11,13 7,11 3,13 3,3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
            </svg>
          )}
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { createNote } = useNotes()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null)

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

  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, padding: '14px 18px 6px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{text}</div>
  )

  const renderNote = (note: Note) => {
    const isActive = pathname === `/notes/${note.id}`
    const isMenuOpen = menuNoteId === note.id
    return (
      <div key={note.id} style={{ position: 'relative', margin: '2px 10px', borderRadius: 10, background: isActive ? 'var(--active-bg)' : 'transparent' }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--hover)' }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div onClick={() => router.push(`/notes/${note.id}`)} style={{ padding: '10px 38px 10px 14px', cursor: 'pointer', userSelect: 'none' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: isActive ? 'var(--active-text)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
            {note.isPinned && (
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5, color: 'var(--text-muted)' }}>
                <path d="M8.5 1.5L12.5 5.5L9 7L7 12L5.5 8.5L1.5 7L6.5 5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <line x1="5.5" y1="8.5" x2="2" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            )}
            {note.title || 'Untitled'}
          </div>
          <div style={{ fontSize: 12, color: isActive ? 'var(--active-sub)' : 'var(--text-muted)', marginTop: 3 }}>
            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setMenuNoteId(isMenuOpen ? null : note.id) }}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 5px', borderRadius: 5, fontSize: 15, lineHeight: 1, letterSpacing: 1, opacity: 0.6 }}
        >···</button>
        {isMenuOpen && <NoteMenu note={note} onDelete={() => handleDelete(note.id)} onPin={() => handlePin(note)} onClose={() => setMenuNoteId(null)} />}
      </div>
    )
  }

  return (
    <>
      <aside style={{ width: 310, height: '100%', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'var(--sidebar-bg)', borderRight: '0.5px solid var(--border)' }}>
        <div style={{ padding: '10px 16px 7px', borderBottom: '0.5px solid var(--border)' }}>
          <button onClick={handleNewNote}
            style={{ width: '100%', padding: '11px 14px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: 'var(--accent-text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            New note
          </button>
        </div>

        <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(border)' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search notes..."
              style={{ width: '100%', background: 'var(--input-bg)', border: 'none', borderRadius: 9, padding: '9px 14px 9px 34px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'sans-serif' }}
            />
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, color: 'var(--text-primary)' }} width="15" height="15" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {searching && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, paddingLeft: 2 }}>Searching...</div>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 10 }}>
          {displayNotes.length === 0 ? (
            <div style={{ padding: '28px 18px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
              {query ? 'No notes found' : 'No notes yet.\nClick "New note" to start.'}
            </div>
          ) : (
            <>
              {pinned.length > 0 && <>{sectionLabel('Pinned')}{pinned.map(renderNote)}</>}
              {unpinned.length > 0 && <>{sectionLabel(pinned.length > 0 ? 'Other notes' : 'Recent')}{unpinned.map(renderNote)}</>}
            </>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--editor-bg)', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </main>
    </>
  )
}
