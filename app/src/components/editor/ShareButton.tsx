'use client'
import { useState, useRef, useEffect } from 'react'

export function ShareButton({ noteId }: { noteId: string }) {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function loadLinks() {
    const res = await fetch(`/api/share?noteId=${noteId}`)
    const { data } = await res.json()
    setLinks(data ?? [])
  }

  async function handleOpen() {
    setOpen(o => !o)
    if (!open) loadLinks()
  }

  async function createLink(permission: 'view' | 'edit') {
    setCreating(true)
    await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, permission }),
    })
    await loadLinks()
    setCreating(false)
  }

  async function deleteLink(id: string) {
    await fetch('/api/share', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadLinks()
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const [hov, setHov] = useState(false)

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={handleOpen}
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
        Share
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', minWidth: 300, padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Share this note</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => createLink('view')}
              disabled={creating}
              style={{ flex: 1, padding: '8px', background: 'var(--hover)', border: '0.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--active-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--hover)')}
            >
              + View link
            </button>
            <button
              onClick={() => createLink('edit')}
              disabled={creating}
              style={{ flex: 1, padding: '8px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--accent-text)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              + Edit link
            </button>
          </div>

          {links.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
              No share links yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.map((link: any) => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--hover)', borderRadius: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: link.permission === 'edit' ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                      {link.permission === 'edit' ? 'Can edit' : 'View only'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {window.location.origin}/shared/{link.token}
                    </div>
                  </div>
                  <button
                    onClick={() => copyLink(link.token)}
                    style={{ padding: '5px 10px', background: copied === link.token ? 'var(--active-bg)' : 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 500, color: copied === link.token ? 'var(--active-text)' : 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {copied === link.token ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    style={{ width: 26, height: 26, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#B04040')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    title="Revoke link"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="2" y1="2" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="2" x2="2" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}