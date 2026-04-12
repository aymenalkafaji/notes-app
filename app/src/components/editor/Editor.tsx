'use client'
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

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: attrs => {
            if (!attrs.fontSize) return {}
            return { style: `font-size: ${attrs.fontSize}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
    } as any
  },
})

interface EditorProps {
  noteId: string
  initialContent?: object
  initialTitle?: string
  onTitleChange?: (title: string) => void
  profileButton?: React.ReactNode
}

interface QuizCard { question: string; answer: string }

const TEMPLATES = [
  { label: 'Blank', icon: '📄', content: null },
  {
    label: 'Meeting', icon: '🗒',
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Meeting notes' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Date:' }, { type: 'text', text: '  ' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Attendees:' }, { type: 'text', text: '  ' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Agenda' }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Action items' }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
    ]},
  },
  {
    label: 'Study', icon: '📚',
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Topic' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Key concepts' }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Summary' }] },
      { type: 'paragraph', content: [{ type: 'text', text: '' }] },
    ]},
  },
  {
    label: 'Journal', icon: '☀️',
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Grateful for' }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: "Today's focus" }] },
      { type: 'paragraph', content: [{ type: 'text', text: '' }] },
    ]},
  },
  {
    label: 'Brainstorm', icon: '💡',
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Brainstorm' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'No idea is too wild. Write everything.' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Ideas' }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Best picks' }] },
      { type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
    ]},
  },
]

const STYLE_OPTIONS = [
  { label: 'Body text', value: 'p', style: { fontSize: 15, fontWeight: 400, color: 'var(--prose-color)' } },
  { label: 'Title', value: 'h1', style: { fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif', color: 'var(--title-color)' } },
  { label: 'Heading', value: 'h2', style: { fontSize: 18, fontWeight: 600, fontFamily: 'Georgia, serif', color: 'var(--title-color)' } },
  { label: 'Subheading', value: 'h3', style: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' } },
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

const Icon = {
  bold: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M5 4h5a3 3 0 010 6H5V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M5 10h6a3 3 0 010 6H5V10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  italic: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="11" y1="4" x2="7" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="5" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  strike: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6 5.5c0-1 1.3-2 3-2s3 1 3 2-1.3 1.5-3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6 12.5c0 1 1.3 2 3 2s3-1 3-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  code: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><polyline points="6,5 2,9 6,13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><polyline points="12,5 16,9 12,13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="10" y1="4" x2="8" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  link: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M7.5 10.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M10.5 7.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  bullet: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><circle cx="3.5" cy="5" r="1.5" fill="currentColor"/><line x1="7" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="3.5" cy="9" r="1.5" fill="currentColor"/><line x1="7" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="3.5" cy="13" r="1.5" fill="currentColor"/><line x1="7" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  numbered: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><text x="1.5" y="7" style={{ fontSize: '7px', fill: 'currentColor', fontFamily: 'sans-serif', fontWeight: 700 }}>1.</text><line x1="7" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><text x="1.5" y="11" style={{ fontSize: '7px', fill: 'currentColor', fontFamily: 'sans-serif', fontWeight: 700 }}>2.</text><line x1="7" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><text x="1.5" y="15" style={{ fontSize: '7px', fill: 'currentColor', fontFamily: 'sans-serif', fontWeight: 700 }}>3.</text><line x1="7" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  quote: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.4"/><line x1="6.5" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="6.5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="6.5" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  codeblock: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="5" y1="7" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="9" x2="5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="10" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  hr: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2"/></svg>,
  clearformat: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><line x1="4" y1="4" x2="10" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="11" x2="15" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="15" y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  undo: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M4 8C4 5.2 6.2 3 9 3c2.4 0 4.4 1.5 5.2 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="2,5 4,8 7,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  redo: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M14 8C14 5.2 11.8 3 9 3 6.6 3 4.6 4.5 3.8 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16,5 14,8 11,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
}

export function Editor({ noteId, initialContent, initialTitle, onTitleChange, profileButton }: EditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [title, setTitle] = useState(initialTitle || '')
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [cards, setCards] = useState<QuizCard[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [showTemplates, setShowTemplates] = useState(!initialContent && !initialTitle)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  const autoSaveContent = useAutoSave(async (content) => {
    setSaveStatus('saving')
    await fetch(`/api/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const text = editor?.getText() ?? ''
    if (text.trim()) {
      fetch('/api/ai/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content: text }),
      }).catch(() => {})
    }
    setSaveStatus('saved')
  })

  const autoSaveTitle = useAutoSave(async (newTitle) => {
    setSaveStatus('saving')
    await fetch(`/api/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    setSaveStatus('saved')
    onTitleChange?.(newTitle)
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
  StarterKit.configure({ codeBlock: { exitOnTripleEnter: false, exitOnArrowDown: true } }),
  Link,
  TextStyle,
  FontFamily,
  Color,
  FontSize,
],

    content: initialContent ?? undefined,
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 400px; font-size: 17px; line-height: 1.85; color: var(--prose-color); font-family: Georgia, serif; caret-color: #D4956A;',
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved')
      autoSaveContent(editor.getJSON())
    },
  })

  useEffect(() => {
    if (editor) {
      const text = editor.getText()
      if (text.trim()) {
        fetch('/api/ai/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId, content: text }),
        }).catch(() => {})
      }
    }
  }, [editor, noteId])

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
    }
  }, [title])

  useEffect(() => {
  const es = new EventSource(`/api/notes/${noteId}/stream`)
  es.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.content && editor && !editor.isFocused) {
      editor.commands.setContent(data.content)
    }
    if (data.title && document.activeElement?.tagName !== 'TEXTAREA') {
      setTitle(data.title)
    }
  }
  return () => es.close()
}, [noteId, editor])

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus('start')
    }
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
    if (!res.body) { setSummarizing(false); return }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setSummary(prev => prev + decoder.decode(value))
    }
    setSummarizing(false)
  }

  async function handleQuiz() {
    if (!editor) return
    const text = editor.getText()
    if (!text.trim()) return
    setQuizLoading(true)
    setFlipped({})
    const res = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
    const { data } = await res.json()
    if (data?.cards) { setCards(data.cards); setShowQuiz(true) }
    setQuizLoading(false)
  }
  function toggleWithColor(command: () => boolean) {
    if (!editor) return
    const { color, fontFamily, fontSize } = editor.getAttributes('textStyle')
    command()
    if (color) editor.chain().setColor(color).run()
    if (fontFamily) editor.chain().setFontFamily(fontFamily).run()
    if (fontSize) editor.chain().setFontSize(fontSize).run()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 56, borderBottom: '0.5px solid var(--border)', flexShrink: 0, background: 'var(--toolbar-bg)', gap: 3, position: 'relative', zIndex: 50 }}>
        <StyleDropdown editor={editor} />
          <FontSizePicker editor={editor} />
          <FontFamilyPicker editor={editor} />
          <ColorPicker editor={editor} />
          <Divider />
        <TBtn onClick={() => toggleWithColor(() => editor!.chain().focus().toggleBold().run())} active={editor?.isActive('bold')} title="Bold (Ctrl+B)">{Icon.bold}</TBtn>
        <TBtn onClick={() => toggleWithColor(() => editor!.chain().focus().toggleItalic().run())} active={editor?.isActive('italic')} title="Italic (Ctrl+I)">{Icon.italic}</TBtn>
        <TBtn onClick={() => toggleWithColor(() => editor!.chain().focus().toggleStrike().run())} active={editor?.isActive('strike')} title="Strikethrough">{Icon.strike}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">{Icon.code}</TBtn>
        <LinkButton editor={editor} />
        <Divider />
        <TBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">{Icon.bullet}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">{Icon.numbered}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">{Icon.quote}</TBtn>
        <TBtn
  onClick={() => {
    if (editor?.isActive('codeBlock')) {
      editor.chain().focus().toggleCodeBlock().run()
      editor.chain().focus().insertContent({ type: 'paragraph' }).run()
    } else {
      editor?.chain().focus().toggleCodeBlock().run()
    }
  }}
  active={editor?.isActive('codeBlock')}
  title="Code block (Esc to exit)"
>
  {Icon.codeblock}
</TBtn>
        <TBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider line">{Icon.hr}</TBtn>
        <Divider />
        <TBtn onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">{Icon.clearformat}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo (Ctrl+Z)">{Icon.undo}</TBtn>
        <TBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">{Icon.redo}</TBtn>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: 12 }}>
          {saveStatus === 'saving' ? '● Saving' : saveStatus === 'saved' ? '✓ Saved' : '○ Unsaved'}
        </span>
        <ShareButton noteId={noteId} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '52px 64px 140px' }}>

          {showTemplates && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Choose a template</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {TEMPLATES.map(t => (
                  <button key={t.label}
                    onClick={() => { if (t.content) editor?.commands.setContent(t.content); setShowTemplates(false); setTimeout(() => titleRef.current?.focus(), 50) }}
                    style={{ padding: '16px 10px', background: 'var(--hover)', border: '0.5px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget.style.borderColor = '#D4956A'); (e.currentTarget.style.background = 'var(--active-bg)') }}
                    onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.background = 'var(--hover)') }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea ref={titleRef} value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setSaveStatus('unsaved')
              autoSaveTitle(e.target.value)
              setShowTemplates(false)
            }}
            onKeyDown={handleTitleKeyDown}
            placeholder="Note title"
            rows={1}
            style={{ width: '100%', fontSize: 38, fontWeight: 700, color: 'var(--title-color)', outline: 'none', border: 'none', background: 'transparent', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', marginBottom: 28, lineHeight: 1.2, display: 'block', resize: 'none', overflow: 'hidden', padding: 0, caretColor: '#D4956A' }}
          />

          <div onClick={() => editor?.commands.focus()}>
            <EditorContent editor={editor} />
          </div>

          {(summary || showQuiz) && (
            <div style={{ marginTop: 56, borderTop: '0.5px solid var(--border)', paddingTop: 40 }}>
              {summary && (
                <div style={{ marginBottom: showQuiz ? 32 : 0, padding: '20px 24px', background: 'var(--active-bg)', borderRadius: 14, border: '0.5px solid var(--active-sub)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4956A' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--active-text)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>AI Summary</span>
                    </div>
                    <button onClick={() => setSummary('')} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--active-text)', lineHeight: 1.75, fontFamily: 'sans-serif', margin: 0 }}>{summary}</p>
                </div>
              )}

              {showQuiz && cards.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Flashcards — tap to reveal</span>
                    </div>
                    <button onClick={() => setShowQuiz(false)} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cards.map((card, i) => (
                      <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
                        style={{ padding: '16px 20px', border: `0.5px solid ${flipped[i] ? 'var(--active-sub)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', background: flipped[i] ? 'var(--active-bg)' : 'var(--editor-bg)', transition: 'all 0.15s' }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>{card.question}</div>
                        {flipped[i] ? (
                          <div style={{ fontSize: 14, color: 'var(--active-text)', paddingTop: 12, marginTop: 12, borderTop: '0.5px solid var(--active-sub)', lineHeight: 1.6 }}>{card.answer}</div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#D4956A', marginTop: 8, fontStyle: 'italic' }}>Tap to reveal →</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 28, right: 28, display: 'flex', gap: 10, zIndex: 50 }}>
        <button onClick={handleQuiz} disabled={quizLoading}
          style={{ padding: '10px 18px', background: 'var(--menu-bg)', border: '0.5px solid var(--border)', borderRadius: 22, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--menu-bg)')}
        >{quizLoading ? 'Generating...' : '🃏 Quiz me'}</button>
        <button onClick={handleSummarize} disabled={summarizing}
          style={{ padding: '10px 18px', background: '#D4956A', border: 'none', borderRadius: 22, fontSize: 13, fontWeight: 600, color: '#FFF8F2', cursor: 'pointer', boxShadow: '0 2px 14px rgba(212,149,106,0.4)', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#C4845A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#D4956A')}
        >{summarizing ? 'Summarizing...' : '✦ Summarize'}</button>
      </div>
    </div>
  )
}
