'use client'
import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string }
}

function UserMenu({ name, email, image, initials, onClose }: {
  name: string; email: string; image?: string | null; initials: string; onClose: () => void
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
    <div ref={ref} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 300, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', minWidth: 250, overflow: 'hidden', padding: '6px 0' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--active-text)', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--accent)' }}>
          {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{email}</div>
        </div>
      </div>
      <div style={{ padding: '6px 0' }}>
        <button onClick={toggleDark}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15 }}>{dark ? '☀️' : '🌙'}</span>
            {dark ? 'Light mode' : 'Dark mode'}
          </span>
          <div style={{ width: 36, height: 21, borderRadius: 11, background: dark ? 'var(--accent)' : 'var(--border-strong)', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: dark ? 18 : 3, width: 15, height: 15, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </button>
        <div style={{ height: '0.5px', background: 'var(--border)', margin: '4px 0' }} />
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#B04040', fontFamily: 'sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="10" y1="7.5" x2="14" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><polyline points="12,5.5 14,7.5 12,9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          Sign out
        </button>
      </div>
    </div>
  )
}

export function TopBar({ user }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const name = user?.name ?? 'User'
  const email = user?.email ?? ''
  const image = user?.image
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'light'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  return (
    <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 20px', background: 'var(--sidebar-bg)', borderBottom: '0.5px solid var(--border)', flexShrink: 0, gap: 12, zIndex: 100 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', lineHeight: 1 }}>
        Note<span style={{ color: 'var(--accent)' }}>wise</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
        Your AI-powered second brain
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(v => !v)}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--active-bg)', border: '2px solid var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--active-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, transition: 'transform 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {image ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </button>
        {showMenu && <UserMenu name={name} email={email} image={image} initials={initials} onClose={() => setShowMenu(false)} />}
      </div>
    </div>
  )
}
