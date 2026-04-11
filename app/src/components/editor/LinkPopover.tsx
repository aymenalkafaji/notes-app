'use client'
import { useState, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'

export function LinkButton({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [hov, setHov] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const active = editor?.isActive('link') ?? false

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      const existing = editor?.getAttributes('link').href ?? ''
      setUrl(existing)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, editor])

  function apply() {
    if (!editor) return
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      const href = url.startsWith('http') ? url : `https://${url}`
      editor.chain().focus().setLink({ href }).run()
    }
    setOpen(false)
    setUrl('')
  }

  function remove() {
    editor?.chain().focus().unsetLink().run()
    setOpen(false)
    setUrl('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); apply() }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, zIndex: 200 }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        title="Add link"
        style={{ width: 36, height: 36, background: active ? 'var(--active-bg)' : hov ? 'var(--hover)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', color: active ? 'var(--active-text)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.1s' }}
      >
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
          <path d="M7.5 10.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M10.5 7.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: '14px 16px', minWidth: 300 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
            Insert link
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://example.com"
              style={{ flex: 1, height: 36, padding: '0 12px', background: 'var(--input-bg)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'sans-serif' }}
            />
            <button
              onClick={apply}
              style={{ height: 36, padding: '0 14px', background: '#D4956A', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#FFF8F2', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#C4845A')}
              onMouseLeave={e => (e.currentTarget.style.background = '#D4956A')}
            >
              Apply
            </button>
          </div>
          {active && (
            <button
              onClick={remove}
              style={{ marginTop: 10, fontSize: 12, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Remove link
            </button>
          )}
        </div>
      )}
    </div>
  )
}
