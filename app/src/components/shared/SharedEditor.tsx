'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
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
  return <div style={{ width: 1, height: 26, background: '#E0DDD8', margin: '0 3px', flexShrink: 0 }} />
}

function TBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 36, height: 36, background: active ? '#EED5B5' : hov ? '#EAE7E0' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', color: active ? '#6B3A10' : '#3C3A36', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.1s' }}
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

export function SharedEditor({ note, token }: { note: any; token: string }) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [title, setTitle] = useState(note.title || '')
  const titleRef = useRef<HTMLTextAreaElement>(null)

  const autoSaveContent = useAutoSave(async (content) => {
    setSaveStatus('saving')
    await fetch(`/api/share/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSaveStatus('saved')
  })

  const autoSaveTitle = useAutoSave(async (newTitle) => {
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
    extensions: [
      StarterKit.configure({ codeBlock: { exitOnArrowDown: true } }),
      Link,
      TextStyle,
      FontFamily,
      Color,
      FontSize,
    ],
    content: note.content ?? undefined,
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 400px; font-size: 17px; line-height: 1.85; color: #3C3A36; font-family: Georgia, serif; caret-color: #D4956A;',
      },
    },
    onUpdate: ({ editor }) => {
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
        if (data.title) setTitle(data.title)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 57px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 56, borderBottom: '0.5px solid #E0DDD8', background: '#FDFBF8', gap: 3, flexShrink: 0, overflowX: 'visible', position: 'relative', zIndex: 200 }}>
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
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#B0ADA6', whiteSpace: 'nowrap' }}>
          {saveStatus === 'saving' ? '● Saving' : saveStatus === 'saved' ? '✓ Saved' : '○ Unsaved'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 48px 120px' }}>
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); autoSaveTitle(e.target.value) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editor?.commands.focus('start') } }}
            placeholder="Untitled"
            rows={1}
            style={{ width: '100%', fontSize: 38, fontWeight: 700, color: '#1C1A17', outline: 'none', border: 'none', background: 'transparent', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', marginBottom: 28, lineHeight: 1.2, display: 'block', resize: 'none', overflow: 'hidden', padding: 0, caretColor: '#D4956A' }}
          />
          <div onClick={() => editor?.commands.focus()}>
            <EditorContent editor={editor} />
          </div>
          <div style={{ marginTop: 64, paddingTop: 24, borderTop: '0.5px solid #E0DDD8', fontSize: 12, color: '#B0ADA6' }}>
            Shared via Notewise — changes save automatically
          </div>
        </div>
      </div>
    </div>
  )
}
