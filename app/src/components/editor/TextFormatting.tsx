'use client'
import { useState, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64, 72]

const FONTS = [
  { label: 'Georgia (default)', value: 'Georgia, serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Palatino', value: 'Palatino Linotype, serif' },
  { label: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
  { label: 'Arial', value: 'Arial, sans-serif' },
]

const COLORS = [
  { label: 'Default', value: null, display: 'var(--text-primary)' },
  { label: 'Amber', value: '#B86A20', display: '#B86A20' },
  { label: 'Red', value: '#C03030', display: '#C03030' },
  { label: 'Blue', value: '#2050A0', display: '#2050A0' },
  { label: 'Green', value: '#206840', display: '#206840' },
  { label: 'Purple', value: '#6030A0', display: '#6030A0' },
  { label: 'Teal', value: '#107870', display: '#107870' },
  { label: 'Gray', value: '#707070', display: '#707070' },
]

function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

function DropdownShell({ label, icon, open, setOpen, children, minWidth = 200 }: {
  label: string; icon: React.ReactNode; open: boolean; setOpen: (v: boolean) => void; children: React.ReactNode; minWidth?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))
  const [hov, setHov] = useState(false)

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, zIndex: open ? 500 : 'auto' }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ height: 38, padding: '0 12px', background: open ? 'var(--active-bg)' : hov ? 'var(--hover)' : 'transparent', border: '0.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: open ? 'var(--active-text)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', fontFamily: 'sans-serif', fontSize: 13, fontWeight: 500, transition: 'all 0.12s' }}
      >
        {icon}
        <span>{label}</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 1000, background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', minWidth, overflow: 'hidden', padding: '6px 0' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export function StyleDropdown({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const prevStyle = useRef<string>('p')

  const STYLE_OPTIONS = [
    { label: 'Body text', value: 'p', desc: 'Regular paragraph', previewStyle: { fontSize: 15, fontWeight: 400, fontFamily: 'Georgia, serif' } },
    { label: 'Title', value: 'h1', desc: 'Large heading', previewStyle: { fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif' } },
    { label: 'Heading', value: 'h2', desc: 'Section heading', previewStyle: { fontSize: 18, fontWeight: 600, fontFamily: 'Georgia, serif' } },
    { label: 'Subheading', value: 'h3', desc: 'Subsection', previewStyle: { fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif' } },
  ]

  const current = editor?.isActive('heading', { level: 1 }) ? 'h1'
    : editor?.isActive('heading', { level: 2 }) ? 'h2'
    : editor?.isActive('heading', { level: 3 }) ? 'h3' : 'p'

  const currentLabel = STYLE_OPTIONS.find(o => o.value === current)?.label ?? 'Body text'

  function applyStyle(val: string) {
    if (!editor) return
    if (val === 'p') editor.chain().focus().setParagraph().run()
    else if (val === 'h1') editor.chain().focus().setHeading({ level: 1 }).run()
    else if (val === 'h2') editor.chain().focus().setHeading({ level: 2 }).run()
    else if (val === 'h3') editor.chain().focus().setHeading({ level: 3 }).run()
  }

  function previewStyle(val: string) {
    if (!editor) return
    if (val === 'p') editor.chain().setParagraph().run()
    else if (val === 'h1') editor.chain().setHeading({ level: 1 }).run()
    else if (val === 'h2') editor.chain().setHeading({ level: 2 }).run()
    else if (val === 'h3') editor.chain().setHeading({ level: 3 }).run()
  }

  return (
    <DropdownShell
      label={currentLabel}
      icon={<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="2" rx="1" fill="currentColor"/><rect x="1" y="6.5" width="9" height="1.5" rx="0.75" fill="currentColor"/><rect x="1" y="11" width="11" height="1.5" rx="0.75" fill="currentColor"/></svg>}
      open={open}
      setOpen={(v) => { if (v) prevStyle.current = current; setOpen(v) }}
      minWidth={220}
    >
      <div style={{ padding: '4px 0' }}>
        {STYLE_OPTIONS.map(opt => (
          <div
            key={opt.value}
            onClick={() => { applyStyle(opt.value); setOpen(false) }}
            onMouseEnter={() => previewStyle(opt.value)}
            onMouseLeave={() => previewStyle(prevStyle.current)}
            style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div>
              <div style={{ ...opt.previewStyle, color: 'var(--text-primary)' }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{opt.desc}</div>
            </div>
            {current === opt.value && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
        ))}
      </div>
    </DropdownShell>
  )
}

export function FontSizePicker({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState(16)

  function applySize(newSize: number, keepOpen = false) {
    if (!editor) return
    const clamped = Math.max(8, Math.min(200, newSize))
    editor.chain().focus().setFontSize(`${clamped}px`).run()
    setSize(clamped)
    if (!keepOpen) setOpen(false)
  }

  function nudge(dir: 1 | -1) {
    const SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64, 72]
    const idx = SIZES.indexOf(size)
    if (idx === -1) {
      const nearest = SIZES.find(s => s > size) ?? SIZES[SIZES.length - 1]!
      applySize(dir === 1 ? nearest : (SIZES[SIZES.indexOf(nearest) - 1] ?? nearest), true)
    } else {
      const next = SIZES[idx + dir]
      if (next) applySize(next, true)
    }
  }

  return (
    <DropdownShell
      label="Size"
      icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><text x="1" y="11" style={{ fontSize: '8px', fontWeight: 700, fill: 'currentColor', fontFamily: 'sans-serif' }}>A</text><text x="7" y="14" style={{ fontSize: '12px', fontWeight: 700, fill: 'currentColor', fontFamily: 'sans-serif' }}>A</text></svg>}
      open={open}
      setOpen={setOpen}
      minWidth={160}
    >
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Font size</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); nudge(-1) }}
            style={{ width: 32, height: 32, background: 'var(--hover)', border: '0.5px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none' }}
          >−</button>
          <input
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            onKeyDown={e => { if (e.key === 'Enter') applySize(size) }}
            onBlur={() => applySize(size)}
            type="number"
            min={8}
            max={200}
            style={{ flex: 1, height: 32, textAlign: 'center', background: 'var(--input-bg)', border: '0.5px solid var(--border)', borderRadius: 7, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', outline: 'none', fontFamily: 'sans-serif', width: 60 }}
          />
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); nudge(1) }}
            style={{ width: 32, height: 32, background: 'var(--hover)', border: '0.5px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none' }}
          >+</button>
        </div>
      </div>
    </DropdownShell>
  )
}

export function FontFamilyPicker({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('Georgia, serif')

  function apply(font: string) {
    if (!editor) return
    editor.chain().focus().setMark('textStyle', { fontFamily: font }).run()
    setCurrent(font)
    setOpen(false)
  }

  const currentLabel = FONTS.find(f => f.value === current)?.label.split(' ')[0] ?? 'Font'

  return (
    <DropdownShell
      label={currentLabel}
      icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><text x="1" y="12" style={{ fontSize: '13px', fontWeight: 700, fill: 'currentColor', fontFamily: 'Georgia, serif' }}>F</text><line x1="9" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
      open={open}
      setOpen={setOpen}
      minWidth={220}
    >
      {FONTS.map(f => (
        <div
          key={f.value}
          onClick={() => apply(f.value)}
          onMouseEnter={() => editor?.chain().setMark('textStyle', { fontFamily: f.value }).run()}
          onMouseLeave={() => editor?.chain().setMark('textStyle', { fontFamily: current }).run()}
          style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div>
            <div style={{ fontSize: 15, fontFamily: f.value, color: 'var(--text-primary)', fontWeight: 500 }}>{f.label.split(' ')[0]}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'sans-serif' }}>{f.label}</div>
          </div>
          {current === f.value && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </div>
      ))}
    </DropdownShell>
  )
}

export function ColorPicker({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

  function apply(color: string | null) {
    if (!editor) return
    if (!color) {
      editor.chain().focus().unsetMark('textStyle').run()
    } else {
      editor.chain().focus().setMark('textStyle', { color }).run()
    }
    setCurrent(color)
    setOpen(false)
  }

  const currentColor = current ?? 'var(--text-primary)'

  return (
    <DropdownShell
      label="Color"
      icon={
        <div style={{ position: 'relative', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <text x="2" y="13" style={{ fontSize: '13px', fill: 'currentColor', fontWeight: 700, fontFamily: 'Georgia, serif' }}>A</text>
            <rect x="2" y="14.5" width="14" height="2.5" rx="1.25" fill={currentColor === 'var(--text-primary)' ? 'var(--accent)' : currentColor}/>
          </svg>
        </div>
      }
      open={open}
      setOpen={setOpen}
      minWidth={200}
    >
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Text color</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {COLORS.map(c => (
            <button
              key={c.label}
              onClick={() => apply(c.value)}
              onMouseEnter={() => { if (c.value) editor?.chain().setMark('textStyle', { color: c.value }).run(); else editor?.chain().unsetMark('textStyle').run() }}
              onMouseLeave={() => { if (current) editor?.chain().setMark('textStyle', { color: current }).run(); else editor?.chain().unsetMark('textStyle').run() }}
              title={c.label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 4px', background: current === c.value ? 'var(--hover)' : 'none', border: current === c.value ? '0.5px solid var(--border)' : '0.5px solid transparent', borderRadius: 8, cursor: 'pointer', transition: 'all 0.1s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseOut={e => (e.currentTarget.style.background = current === c.value ? 'var(--hover)' : 'none')}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.display, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {!c.value && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="2" x2="10" y2="10" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.label}</div>
            </button>
          ))}
        </div>
      </div>
    </DropdownShell>
  )
}
