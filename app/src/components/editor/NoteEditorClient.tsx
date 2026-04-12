'use client'
import { useCallback, useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Editor } from './Editor'
import { PresenceAvatars } from './PresenceAvatars'

interface Props {
  noteId: string
  initialContent?: object
  initialTitle?: string
}

function UserMenu({ initials, name, email, image, onClose }: {
  initials: string; name: string; email: string; image?: string | null; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dark, setDark] = useState(() => typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div ref={ref} style={{ position: 'absolute', top: '110%', right: 0, zIndex: 1000, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', minWidth: 240, overflow: 'hidden', padding: '6px 0' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8C9A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#7A4A1A', flexShrink: 0, overflow: 'hidden' }}>
          {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{email}</div>
        </div>
      </div>
      <div style={{ padding: '6px 0' }}>
        <button onClick={toggleDark}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{dark ? '☀️' : '🌙'}</span>
            {dark ? 'Light mode' : 'Dark mode'}
          </span>
          <div style={{ width: 34, height: 20, borderRadius: 10, background: dark ? '#D4956A' : 'var(--border-strong)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: dark ? 17 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </div>
        </button>
        <div style={{ height: '0.5px', background: 'var(--border)', margin: '4px 0' }} />
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#C0392B', fontFamily: 'sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: 16 }}>🚪</span> Sign out
        </button>
      </div>
    </div>
  )
}

export function NoteEditorClient({ noteId, initialContent, initialTitle }: Props) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleTitleChange = useCallback((newTitle: string) => {
    window.dispatchEvent(new CustomEvent('note-title-changed', { detail: { noteId, title: newTitle } }))
  }, [noteId])

  const name = session?.user?.name ?? 'User'
  const email = session?.user?.email ?? ''
  const image = session?.user?.image
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const presenceUser = session?.user?.id ? {
      id: session.user.id,
      name: session.user.name ?? 'User',
      image: session.user.image,
    } : null
  const profileButton = (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setShowUserMenu(v => !v)}
        style={{ width: 38, height: 38, borderRadius: '50%', background: '#E8C9A0', border: '2.5px solid #D4956A', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#7A4A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, flexShrink: 0 }}
      >
        {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </button>
      {showUserMenu && (
        <UserMenu
          initials={initials}
          name={name}
          email={email}
          image={image}
          onClose={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Editor
        noteId={noteId}
        initialContent={initialContent}
        initialTitle={initialTitle}
        onTitleChange={handleTitleChange}
        profileButton={profileButton}
      />
    </div>
  )
}