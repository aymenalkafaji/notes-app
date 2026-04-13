'use client'
import { useState, useRef, useEffect } from 'react'

export function ShareButton({ noteId }: { noteId: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'view' | 'edit' | null>(null)
  const [loading, setLoading] = useState<'view' | 'edit' | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [hov, setHov] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function copyLink(permission: 'view' | 'edit') {
    setLoading(permission)
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, permission }),
    })
    const { data } = await res.json()
    if (data?.token) {
      const url = `${window.location.origin}/shared/${data.token}`
      await navigator.clipboard.writeText(url)
      setCopied(permission)
      setTimeout(() => { setCopied(null); setOpen(false) }, 2000)
    }
    setLoading(null)
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ height: 34, padding: '0 14px', background: hov || open ? 'var(--hover)' : 'transparent', border: '0.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="3" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3"/>
          <line x1="4.8" y1="6.5" x2="10.2" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="4.8" y1="8.5" x2="10.2" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Colaborate
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', minWidth: 220, padding: '12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Share note</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => copyLink('view')}
              disabled={!!loading}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--hover)', border: '0.5px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--hover)')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {copied === 'view' ? '✓ Copied!' : loading === 'view' ? 'Generating...' : 'Copy view link'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Anyone can read</div>
              </div>
            </button>

            <button
              onClick={() => copyLink('edit')}
              disabled={!!loading}
              style={{ width: '100%', padding: '10px 14px', background: copied === 'edit' ? 'var(--active-bg)' : 'var(--hover)', border: `0.5px solid ${copied === 'edit' ? 'var(--active-sub)' : 'var(--border)'}`, borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (copied !== 'edit') e.currentTarget.style.background = 'var(--input-bg)' }}
              onMouseLeave={e => { if (copied !== 'edit') e.currentTarget.style.background = 'var(--hover)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10.5 2.5L13.5 5.5L6 13H3V10L10.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: copied === 'edit' ? 'var(--active-text)' : 'var(--text-primary)' }}>
                  {copied === 'edit' ? '✓ Copied!' : loading === 'edit' ? 'Generating...' : 'Copy edit link'}
                </div>
                <div style={{ fontSize: 11, color: copied === 'edit' ? 'var(--active-sub)' : 'var(--text-muted)', marginTop: 1 }}>Anyone can edit</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
