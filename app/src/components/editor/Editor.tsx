'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useState, useEffect, useRef } from 'react'
import { LinkButton } from './LinkPopover'
import { StyleDropdown, FontSizePicker, FontFamilyPicker, ColorPicker } from './TextFormatting'
import { Extension } from '@tiptap/core'
import { ShareButton } from './ShareButton'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{ types: ['textStyle'], attributes: { fontSize: { default: null, parseHTML: el => el.style.fontSize || null, renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} } } }]
  },
  addCommands() {
    return { setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run() } as any
  },
})

interface EditorProps {
  noteId: string
  initialContent?: object
  initialTitle?: string
  onTitleChange?: (title: string) => void
}

interface QuizCard { question: string; answer: string }

const TEMPLATES = [
  { label: 'Blank', icon: '📄', content: null },
  { label: 'Meeting', icon: '🗒', content: { type: 'doc', content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Meeting notes' }] },
    { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Date:' }, { type: 'text', text: '  ' }] },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Agenda' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Action items' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
  ]}},
  { label: 'Study', icon: '📚', content: { type: 'doc', content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Topic' }] },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Key concepts' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
  ]}},
  { label: 'Journal', icon: '☀️', content: { type: 'doc', content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }] },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Grateful for' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
  ]}},
  { label: 'Brainstorm', icon: '💡', content: { type: 'doc', content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Brainstorm' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
  ]}},
]

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

function TaskListButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = editor?.isActive('taskList') ?? false

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function removeDone() {
    if (!editor) return
    editor.chain().focus().command(({ tr, state, dispatch }) => {
      if (!dispatch) return true
      const toDelete: { from: number; to: number }[] = []
      state.doc.forEach((node, offset) => {
        if (node.type.name === 'taskList') {
          node.forEach((item, itemOffset) => {
            if (item.attrs.checked) {
              const from = offset + 1 + itemOffset
              toDelete.push({ from, to: from + item.nodeSize })
            }
          })
        }
      })
      toDelete.reverse().forEach(({ from, to }) => tr.delete(from, to))
      return true
    }).run()
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TBtn onClick={() => editor?.chain().focus().toggleTaskList().run()} active={active} title="To-do list">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="4" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <polyline points="3.5,6.5 4.5,7.5 6,5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <line x1="9" y1="6.5" x2="16" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="2" y="11" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="9" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </TBtn>
        <button onClick={() => setOpen(o => !o)}
          style={{ width: 14, height: 36, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 9, marginLeft: -2 }}
        >▾</button>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 1000, background: 'var(--menu-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.15)', minWidth: 190, padding: '4px 0' }}>
          <button onClick={() => { editor?.chain().focus().toggleTaskList().run(); setOpen(false) }}
            style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >Toggle to-do list</button>
          <div style={{ height: '0.5px', background: 'var(--border)', margin: '2px 0' }} />
          <button onClick={removeDone}
            style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#C04040', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >Remove done items</button>
        </div>
      )}
    </div>
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
  clearformat: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="4" y1="4" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="11" x2="15" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="15" y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  undo: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M4 8C4 5.2 6.2 3 9 3c2.4 0 4.4 1.5 5.2 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="2,5 4,8 7,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  redo: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M14 8C14 5.2 11.8 3 9 3 6.6 3 4.6 4.5 3.8 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16,5 14,8 11,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
}

export function Editor({ noteId, initialContent, initialTitle, onTitleChange }: EditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
const [title, setTitle] = useState(initialTitle || '')
const [summary, setSummary] = useState('')
const [summarizing, setSummarizing] = useState(false)
const [cards, setCards] = useState<QuizCard[]>([])
const [quizLoading, setQuizLoading] = useState(false)
const [showQuiz, setShowQuiz] = useState(false)
const [flipped, setFlipped] = useState<Record<number, boolean>>({})
const [showTemplates, setShowTemplates] = useState(!initialContent && !initialTitle)
const [showRewrite, setShowRewrite] = useState(false)
const [rewriting, setRewriting] = useState(false)
const titleRef = useRef<HTMLTextAreaElement>(null)

  const autoSaveContent = useAutoSave(async (content) => {
    setSaveStatus('saving')
    await fetch(`/api/notes/${noteId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    const text = editor?.getText() ?? ''
    if (text.trim()) fetch('/api/ai/embed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noteId, content: text }) }).catch(() => {})
    setSaveStatus('saved')
  })

  const autoSaveTitle = useAutoSave(async (newTitle) => {
    setSaveStatus('saving')
    await fetch(`/api/notes/${noteId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) })
    setSaveStatus('saved')
    onTitleChange?.(newTitle)
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: { exitOnTripleEnter: false, exitOnArrowDown: true } }),
      Link, TextStyle, FontFamily, Color, FontSize,
      TaskList, TaskItem.configure({ nested: true }),
    ],
    content: initialContent ?? undefined,
    editorProps: {
      attributes: { style: 'outline: none; min-height: 400px; font-size: 17px; line-height: 1.9; color: var(--prose-color); font-family: Fraunces, Georgia, serif; caret-color: var(--accent);' },
    },
    onUpdate: ({ editor }) => { setSaveStatus('unsaved'); autoSaveContent(editor.getJSON()) },
  })

  useEffect(() => {
  if (editor && initialContent && editor.isEmpty) {
    editor.commands.setContent(initialContent)
  }
}, [editor, initialContent])

  useEffect(() => {
    if (editor) {
      const text = editor.getText()
      if (text.trim()) fetch('/api/ai/embed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noteId, content: text }) }).catch(() => {})
    }
  }, [editor, noteId])

  useEffect(() => {
    if (titleRef.current) { titleRef.current.style.height = 'auto'; titleRef.current.style.height = titleRef.current.scrollHeight + 'px' }
  }, [title])

  useEffect(() => {
    const es = new EventSource(`/api/notes/${noteId}/stream`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.content && editor && !editor.isFocused) editor.commands.setContent(data.content)
        if (data.title && document.activeElement?.tagName !== 'TEXTAREA') setTitle(data.title)
      } catch {}
    }
    return () => es.close()
  }, [noteId, editor])

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') { e.preventDefault(); editor?.commands.focus('start') }
  }

  function toggleWithColor(command: () => boolean) {
    if (!editor) return
    const { color, fontFamily, fontSize } = editor.getAttributes('textStyle')
    command()
    setTimeout(() => {
      if (color) editor.chain().setColor(color).run()
      if (fontFamily) editor.chain().setFontFamily(fontFamily).run()
      if (fontSize) editor.chain().setFontSize(fontSize).run()
    }, 0)
  }

  async function handleSummarize() {
  if (!editor) return
  const text = editor.getText()
  if (!text.trim()) return
  setSummarizing(true)
  setSummary('')
  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text }),
  })
  const result = await res.text()
  setSummary(result)
  setSummarizing(false)
}

  async function handleQuiz() {
    if (!editor) return
    const text = editor.getText()
    if (!text.trim()) return
    setQuizLoading(true); setFlipped({})
    const res = await fetch('/api/ai/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }) })
    const { data } = await res.json()
    if (data?.cards) { setCards(data.cards); setShowQuiz(true) }
    setQuizLoading(false)
  }

  const glass: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow-lg)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 8, height: '100%' }}>

      {/* TOOLBAR ISLAND */}
      <div style={{ ...glass, borderRadius: 20, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 12px', height: 56, gap: 3, position: 'relative', zIndex: 50 }}>
        <StyleDropdown editor={editor} />
        <FontSizePicker editor={editor} />
        <FontFamilyPicker editor={editor} />
        <ColorPicker editor={editor} />
        <Divider />
        <TBtn onClick={() => toggleWithColor(() => editor!.chain().focus().toggleBold().run())} active={editor?.isActive('bold')} title="Bold">{Icon.bold}</TBtn>
        <TBtn onClick={() => toggleWithColor(() => editor!.chain().focus().toggleItalic().run())} active={editor?.isActive('italic')} title="Italic">{Icon.italic}</TBtn>
        <TBtn onClick={() => toggleWithColor(() => editor!.chain().focus().toggleStrike().run())} active={editor?.isActive('strike')} title="Strikethrough">{Icon.strike}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">{Icon.code}</TBtn>
        <LinkButton editor={editor} />
        <Divider />
        <TBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">{Icon.bullet}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">{Icon.numbered}</TBtn>
        <TaskListButton editor={editor} />
        <TBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">{Icon.quote}</TBtn>
        <TBtn onClick={() => { if (editor?.isActive('codeBlock')) { editor.chain().focus().toggleCodeBlock().run(); editor.chain().focus().insertContent({ type: 'paragraph' }).run() } else { editor?.chain().focus().toggleCodeBlock().run() } }} active={editor?.isActive('codeBlock')} title="Code block">{Icon.codeblock}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">{Icon.hr}</TBtn>
        <Divider />
        <TBtn onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">{Icon.clearformat}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">{Icon.undo}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">{Icon.redo}</TBtn>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: 10 }}>
          {saveStatus === 'saving' ? '● Saving' : saveStatus === 'saved' ? '✓ Saved' : '○ Unsaved'}
        </span>
        <ShareButton noteId={noteId} />
      </div>

      {/* EDITOR BODY ISLAND */}
      <div style={{ ...glass, borderRadius: 20, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '52px 64px 160px' }}>

            {showTemplates && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>Start from a template</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                  {TEMPLATES.map(t => (
                    <button key={t.label}
                      onClick={() => { if (t.content) editor?.commands.setContent(t.content); setShowTemplates(false); setTimeout(() => titleRef.current?.focus(), 50) }}
                      style={{ padding: '16px 10px', background: 'var(--hover)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget.style.borderColor = 'var(--accent)'); (e.currentTarget.style.background = 'var(--active-bg)'); (e.currentTarget.style.transform = 'translateY(-2px)') }}
                      onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.background = 'var(--hover)'); (e.currentTarget.style.transform = 'none') }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea ref={titleRef} value={title}
              onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); autoSaveTitle(e.target.value); setShowTemplates(false) }}
              onKeyDown={handleTitleKeyDown}
              placeholder="Note title"
              rows={1}
              style={{ width: '100%', fontSize: 42, fontWeight: 600, color: 'var(--title-color)', outline: 'none', border: 'none', background: 'transparent', fontFamily: 'Fraunces, Georgia, serif', letterSpacing: '-0.6px', marginBottom: 32, lineHeight: 1.15, display: 'block', resize: 'none', overflow: 'hidden', padding: 0, caretColor: 'var(--accent)' }}
            />

            <div onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>

            {(summary || showQuiz) && (
              <div style={{ marginTop: 56, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
                {summary && (
                  <div style={{ marginBottom: showQuiz ? 32 : 0, padding: '20px 24px', background: 'var(--active-bg)', borderRadius: 16, border: '1px solid var(--active-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--active-text)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>✦ AI Summary</span>
                      <button onClick={() => setSummary('')} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--active-text)', lineHeight: 1.75, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{summary}</p>
                  </div>
                )}
                {showQuiz && cards.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>Flashcards</span>
                      <button onClick={() => setShowQuiz(false)} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {cards.map((card, i) => (
                        <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
                          style={{ padding: '16px 20px', border: `1px solid ${flipped[i] ? 'var(--active-border)' : 'var(--border)'}`, borderRadius: 14, cursor: 'pointer', background: flipped[i] ? 'var(--active-bg)' : 'transparent', transition: 'all 0.15s' }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>{card.question}</div>
                          {flipped[i]
                            ? <div style={{ fontSize: 14, color: 'var(--active-text)', paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--active-border)', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>{card.answer}</div>
                            : <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8, fontStyle: 'italic' }}>Tap to reveal →</div>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI FLOATING BUTTONS */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', gap: 10, zIndex: 100 }}>
        <button onClick={handleQuiz} disabled={quizLoading}
          style={{ padding: '10px 18px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 22, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', boxShadow: 'var(--glass-shadow)', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg-strong)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
        >{quizLoading ? 'Generating...' : '🃏 Quiz me'}</button>
        <button onClick={handleSummarize} disabled={summarizing}
          style={{ padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 22, fontSize: 13, fontWeight: 600, color: 'var(--accent-text)', cursor: 'pointer', boxShadow: `0 4px 20px var(--accent-glow)`, fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >{summarizing ? 'Summarizing...' : '✦ Summarize'}</button>
        <button onClick={() => setShowRewrite(v => !v)}
          style={{ padding: '10px 18px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 22, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', boxShadow: 'var(--glass-shadow)', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg-strong)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
        >✏️ Rewrite</button>
        {showRewrite && (
  <div style={{ position: 'fixed', bottom: 80, right: 28, zIndex: 101, background: 'var(--glass-bg-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 16, boxShadow: 'var(--glass-shadow-lg)', padding: '12px', minWidth: 200 }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>Rewrite as</div>
    {[
      { key: 'professional', label: '💼 Professional' },
      { key: 'casual', label: '😊 Casual' },
      { key: 'concise', label: '✂️ Concise' },
      { key: 'detailed', label: '📖 Detailed' },
      { key: 'bullet', label: '• Bullet points' },
    ].map(s => (
      <button key={s.key}
        onClick={async () => {
  if (!editor) return
  const text = editor.getText()
  if (!text.trim()) return
  setRewriting(true)
  setShowRewrite(false)
  try {
    const res = await fetch('/api/ai/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, style: s.key }),
    })
    const { doc } = await res.json()
    if (doc) editor.commands.setContent(doc)
  } catch {}
  setRewriting(false)
}}
        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', borderRadius: 8 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >{s.label}</button>
    ))}
  </div>
)}
      </div>
    </div>
  )
}
