import { getShareLink } from '@/lib/db/queries/notes'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db/client'
import { notes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function SharedNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const link = await getShareLink(token)
  if (!link) notFound()

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) notFound()

  const [note] = await db.select().from(notes).where(eq(notes.id, link.noteId))
  if (!note) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF8', padding: '60px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2C2A26', fontFamily: 'Georgia, serif' }}>
            Note<span style={{ color: '#D4956A' }}>wise</span>
          </div>
          <div style={{ fontSize: 12, color: '#B0ADA6', background: '#F2EFE9', padding: '3px 10px', borderRadius: 20, border: '0.5px solid #E0DDD8' }}>
            {link.permission === 'view' ? 'View only' : 'Can edit'}
          </div>
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 700, color: '#1C1A17', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', marginBottom: 32, lineHeight: 1.2 }}>
          {note.title || 'Untitled'}
        </h1>

        <div
          style={{ fontSize: 17, lineHeight: 1.85, color: '#3C3A36', fontFamily: 'Georgia, serif' }}
          dangerouslySetInnerHTML={{ __html: jsonToHtml(note.content as any) }}
        />

        <div style={{ marginTop: 64, paddingTop: 24, borderTop: '0.5px solid #E0DDD8', fontSize: 12, color: '#B0ADA6' }}>
          Shared via Notewise
        </div>
      </div>
    </div>
  )
}

function jsonToHtml(content: any): string {
  if (!content?.content) return ''
  return content.content.map((node: any) => nodeToHtml(node)).join('')
}

function nodeToHtml(node: any): string {
  if (!node) return ''
  const children = node.content?.map((n: any) => nodeToHtml(n)).join('') ?? ''
  const text = node.text ? escapeHtml(node.text) : children
  const styled = applyMarks(text, node.marks ?? [])

  switch (node.type) {
    case 'paragraph': return `<p style="margin-bottom:1rem;line-height:1.85">${styled || '&nbsp;'}</p>`
    case 'heading': return `<h${node.attrs?.level ?? 2} style="font-family:Georgia,serif;font-weight:700;margin:1.5rem 0 0.5rem;color:#1C1A17">${styled}</h${node.attrs?.level ?? 2}>`
    case 'bulletList': return `<ul style="list-style:disc;padding-left:1.5rem;margin-bottom:1rem">${children}</ul>`
    case 'orderedList': return `<ol style="list-style:decimal;padding-left:1.5rem;margin-bottom:1rem">${children}</ol>`
    case 'listItem': return `<li style="margin-bottom:0.25rem">${children}</li>`
    case 'blockquote': return `<blockquote style="border-left:3px solid #D4956A;padding-left:1rem;color:#9C9890;font-style:italic;margin:1rem 0">${children}</blockquote>`
    case 'codeBlock': return `<pre style="background:#1C1A14;color:#E8E0D0;padding:1rem;border-radius:8px;overflow-x:auto;margin:1rem 0"><code>${children}</code></pre>`
    case 'horizontalRule': return `<hr style="border:none;border-top:0.5px solid #E0DDD8;margin:1.5rem 0"/>`
    case 'text': return styled
    default: return children
  }
}

function applyMarks(text: string, marks: any[]): string {
  return marks.reduce((t, mark) => {
    switch (mark.type) {
      case 'bold': return `<strong style="font-weight:600">${t}</strong>`
      case 'italic': return `<em>${t}</em>`
      case 'strike': return `<s>${t}</s>`
      case 'link': return `<a href="${mark.attrs?.href}" style="color:#D4956A;text-decoration:underline" target="_blank" rel="noopener">${t}</a>`
      case 'textStyle': {
        const style = [
          mark.attrs?.color ? `color:${mark.attrs.color}` : '',
          mark.attrs?.fontSize ? `font-size:${mark.attrs.fontSize}` : '',
          mark.attrs?.fontFamily ? `font-family:${mark.attrs.fontFamily}` : '',
        ].filter(Boolean).join(';')
        return style ? `<span style="${style}">${t}</span>` : t
      }
      default: return t
    }
  }, text)
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}