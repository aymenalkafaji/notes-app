'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useState, useEffect, useRef } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { StyleDropdown, FontSizePicker, FontFamilyPicker, ColorPicker } from '@/components/editor/TextFormatting'
import { LinkButton } from '@/components/editor/LinkPopover'

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{ types: ['textStyle'], attributes: { fontSize: { default: null, parseHTML: el => el.style.fontSize || null, renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} } } }]
  },
  addCommands() {
    return { setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run() } as any
  },
})

function Divider() {
  return <div style={{ width: 1, height: 26, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
}

function TBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 36, height: 36, background: active ? 'var(--active-bg)' : hov ? 'var(--hover)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', color: active ? 'var(--active-text)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.1s' }}
    >{children}</button>
  )
}

const Icon = {
  bold: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M5 4h5a3 3 0 010 6H5V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M5 10h6a3 3 0 010 6H5V10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  italic: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="11" y1="4" x2="7" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="5" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  strike: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6 5.5c0-1 1.3-2 3-2s3 1 3 2-1.3 1.5-3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6 12.5c0 1 1.3 2 3 2s3-1 3-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  code: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><polyline points="6,5 2,9 6,13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><polyline points="12,5 16,9 12,13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="10" y1="4" x2="8" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  bullet: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><circle cx="3.5" cy="5" r="1.5" fill="currentColor"/><line x1="7" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="3.5" cy="9" r="1.5" fill="currentColor"/><line x1="7" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="3.5" cy="13" r="1.5" fill="currentColor"/><line x1="7" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  numbered: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><text x="1.5" y="7" style={{ fontSize: '7px', fill: 'currentColor', fontFamily: 'sans-serif', fontWeight: 700 }}>1.</text><line x1="7" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><text x="1.5" y="11" style={{ fontSize: '7px', fill: 'currentColor', fontFamily: 'sans-serif', fontWeight: 700 }}>2.</text><line x1="7" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><text x="1.5" y="15" style={{ fontSize: '7px', fill: 'currentColor', fontFamily: 'sans-serif', fontWeight: 700 }}>3.</text><line x1="7" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  quote: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.4"/><line x1="6.5" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="6.5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="6.5" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  codeblock: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="5" y1="7" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="9" x2="5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  hr: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2"/></svg>,
  clear: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="4" y1="4" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="11" x2="15" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="15" y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  undo: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M4 8C4 5.2 6.2 3 9 3c2.4 0 4.4 1.5 5.2 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="2,5 4,8 7,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  redo: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M14 8C14 5.2 11.8 3 9 3 6.6 3 4.6 4.5 3.8 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16,5 14,8 11,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
}

interface Props {
  note: any
  token: string
  permission: 'view' | 'edit'
  currentUser?: { id?: string; name?: string | null; email?: string | null; image?: string | null } | null
}

export function SharedEditor({ note, token, permission }: Props) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [title, setTitle] = useState(note.title || '')
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Presence heartbeat — keeps this user in Redis so COLLABORATION tab stays visible
  useEffect(() => {
    const userId = (() => {
      let id = localStorage.getItem('notewise-uid')
      if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem('notewise-uid', id) }
      return id
    })()
    const name = localStorage.getItem('notewise-name') || 'Guest'

    const ping = () => fetch(`/api/notes/${note.id}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, userId }),
    }).catch(() => {})

    ping()
    const interval = setInterval(ping, 60_000)

    const leave = () => fetch(`/api/notes/${note.id}/presence`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {})

    window.addEventListener('beforeunload', leave)
    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', leave)
      // Do NOT delete on unmount — session should persist until TTL (30 min) expires.
      // Only clear on actual browser/tab close (beforeunload above).
    }
  }, [note.id])
  const isEditable = permission === 'edit'

  const autoSaveContent = useAutoSave(async (content) => {
    if (!isEditable) return
    setSaveStatus('saving')
    await fetch(`/api/share/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSaveStatus('saved')
  })

  const autoSaveTitle = useAutoSave(async (newTitle) => {
    if (!isEditable) return
    setSaveStatus('saving')
    await fetch(`/api/share/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    setSaveStatus('saved')
  })

  const editor = useEditor({
    immediatelyRender: false,
    editable: isEditable,
    extensions: [
      StarterKit.configure({ codeBlock: { exitOnTripleEnter: false, exitOnArrowDown: true } }),
      Link, TextStyle, FontFamily, Color, FontSize,
      TaskList, TaskItem.configure({ nested: true }),
    ],
    content: note.content ?? undefined,
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 400px; font-size: 17px; line-height: 1.9; color: var(--prose-color); font-family: Fraunces, Georgia, serif; caret-color: var(--accent);',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isEditable) return
      setSaveStatus('unsaved')
      autoSaveContent(editor.getJSON())
    },
  })

  useEffect(() => {
    const es = new EventSource(`/api/notes/${note.id}/stream`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.content && editor && !editor.isFocused) editor.commands.setContent(data.content)
        if (data.title && document.activeElement?.tagName !== 'TEXTAREA') setTitle(data.title)
      } catch {}
    }
    return () => es.close()
  }, [note.id, editor])

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
    }
  }, [title])

  const glass: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow-lg)',
  }

  // Permission badge
  const badge = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: isEditable ? 'var(--active-bg)' : 'var(--hover)', border: `1px solid ${isEditable ? 'var(--active-border)' : 'var(--border)'}`, flexShrink: 0 }}>
      {isEditable ? (
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5L9.5 3.5L4 9H2V7L7.5 1.5Z" stroke="var(--accent)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="4" r="2" stroke="var(--text-muted)" strokeWidth="1.2"/><path d="M1 10c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>
      )}
      <span style={{ fontSize: 11, fontWeight: 600, color: isEditable ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.03em', fontFamily: 'DM Sans, sans-serif' }}>
        {isEditable ? 'Can edit' : 'View only'}
      </span>
    </div>
  )

  // Grayed-out mic button (owner-only feature)
  const disabledMic = (
    <button
      title="Transcription is only available to the note owner"
      disabled
      style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'default', background: 'transparent', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4 }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="6" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3.5 9.5c0 3 2.5 5 5.5 5s5.5-2 5.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="14.5" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6.5" y1="17" x2="11.5" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 8, height: '100%' }}>

      {/* TOOLBAR ISLAND */}
      <div style={{ ...glass, borderBottom: '1px solid transparent', borderRadius: 20, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 12px', height: 56, gap: 3, position: 'relative', zIndex: 50 }}>
        {isEditable ? (
          <>
            <StyleDropdown editor={editor} />
            <FontSizePicker editor={editor} />
            <FontFamilyPicker editor={editor} />
            <ColorPicker editor={editor} />
            <Divider />
            <TBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold">{Icon.bold}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic">{Icon.italic}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough">{Icon.strike}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">{Icon.code}</TBtn>
            <LinkButton editor={editor} />
            <Divider />
            <TBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">{Icon.bullet}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">{Icon.numbered}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">{Icon.quote}</TBtn>
            <TBtn onClick={() => { if (editor?.isActive('codeBlock')) { editor.chain().focus().toggleCodeBlock().run(); editor.chain().focus().insertContent({ type: 'paragraph' }).run() } else { editor?.chain().focus().toggleCodeBlock().run() } }} active={editor?.isActive('codeBlock')} title="Code block">{Icon.codeblock}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">{Icon.hr}</TBtn>
            <Divider />
            <TBtn onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">{Icon.clear}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">{Icon.undo}</TBtn>
            <TBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">{Icon.redo}</TBtn>
          </>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            {note.title || 'Untitled'}
          </span>
        )}

        <div style={{ flex: 1 }} />

        {disabledMic}

        {isEditable && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: 6, fontFamily: 'DM Sans, sans-serif' }}>
            {saveStatus === 'saving' ? '● Saving' : saveStatus === 'saved' ? '✓ Saved' : '○ Unsaved'}
          </span>
        )}

        {/* Theme toggle */}
        <TBtn onClick={() => {
          const next = document.documentElement.getAttribute('data-theme') !== 'dark'
          document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
          localStorage.setItem('theme', next ? 'dark' : 'light')
        }} title="Toggle dark mode">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 11A7 7 0 016 3a7 7 0 100 12 7 7 0 009-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </TBtn>

        <Divider />
        {badge}
      </div>

      {/* EDITOR BODY ISLAND */}
      <div style={{ ...glass, borderTop: '1px solid transparent', borderRadius: 20, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '52px 64px 160px' }}>
            {isEditable ? (
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); autoSaveTitle(e.target.value) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editor?.commands.focus('start') } }}
                placeholder="Note title"
                rows={1}
                style={{ width: '100%', fontSize: 42, fontWeight: 600, color: 'var(--title-color)', outline: 'none', border: 'none', background: 'transparent', fontFamily: 'Fraunces, Georgia, serif', letterSpacing: '-0.6px', marginBottom: 32, lineHeight: 1.15, display: 'block', resize: 'none', overflow: 'hidden', padding: 0, caretColor: 'var(--accent)' }}
              />
            ) : (
              <h1 style={{ fontSize: 42, fontWeight: 600, color: 'var(--title-color)', fontFamily: 'Fraunces, Georgia, serif', letterSpacing: '-0.6px', marginBottom: 32, lineHeight: 1.15 }}>
                {title || 'Untitled'}
              </h1>
            )}

            <div onClick={() => isEditable && editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
