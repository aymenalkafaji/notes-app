'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { SharedEditor } from './SharedEditor'
import { PresenceAvatars } from '@/components/editor/PresenceAvatars'

interface Props {
  note: any
  token: string
  permission: 'view' | 'edit'
  currentUser: { id?: string; name?: string | null; email?: string | null; image?: string | null } | null
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

export function SharedNoteClient({ note, token, permission, currentUser }: Props) {
  const [signingIn, setSigningIn] = useState(false)

  const presenceUser = currentUser?.id ? {
    id: currentUser.id,
    name: currentUser.name ?? 'User',
    image: currentUser.image,
  } : null

  const permissionBadge = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: permission === 'edit' ? '#FFF3E8' : '#F2EFE9',
      border: `0.5px solid ${permission === 'edit' ? '#E8C9A0' : '#E0DDD8'}`,
    }}>
      {permission === 'edit' ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M7.5 1.5L9.5 3.5L4 9H2V7L7.5 1.5Z" stroke="#C07840" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="4" r="2" stroke="#9C9890" strokeWidth="1.2"/>
          <path d="M1 10c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="#9C9890" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )}
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: permission === 'edit' ? '#C07840' : '#9C9890',
        letterSpacing: '0.03em',
      }}>
        {permission === 'edit' ? 'Can edit' : 'View only'}
      </span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF8', display: 'flex', flexDirection: 'column' }}>

      <div style={{ padding: '12px 24px', borderBottom: '0.5px solid #E0DDD8', display: 'flex', alignItems: 'center', gap: 12, background: '#F2EFE9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#2C2A26', fontFamily: 'Georgia, serif' }}>
            Note<span style={{ color: '#D4956A' }}>wise</span>
          </div>
          <div style={{ width: 1, height: 16, background: '#E0DDD8' }} />
          <div style={{ fontSize: 13, color: '#5C5A56', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.title || 'Untitled'}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <PresenceAvatars noteId={note.id} currentUser={presenceUser} />

        {permissionBadge}

        {currentUser?.id ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E8C9A0', border: '2px solid #D4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#7A4A1A', overflow: 'hidden' }}>
              {currentUser.image
                ? <img src={currentUser.image} alt={currentUser.name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (currentUser.name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              }
            </div>
            <span style={{ fontSize: 12, color: '#5C5A56', fontWeight: 500 }}>{currentUser.name}</span>
          </div>
        ) : (
          <button
            onClick={() => { setSigningIn(true); signIn('google', { callbackUrl: `/shared/${token}` }) }}
            disabled={signingIn}
            style={{ padding: '7px 14px', background: '#D4956A', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#FFF8F2', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#C4845A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#D4956A')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2 13c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {signingIn ? 'Signing in...' : 'Sign in'}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {permission === 'edit' ? (
          <SharedEditor note={note} token={token} />
        ) : (
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 48px 120px' }}>
            <h1 style={{ fontSize: 38, fontWeight: 700, color: '#1C1A17', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', marginBottom: 32, lineHeight: 1.2 }}>
              {note.title || 'Untitled'}
            </h1>
            <div
              style={{ fontSize: 17, lineHeight: 1.85, color: '#3C3A36', fontFamily: 'Georgia, serif' }}
              dangerouslySetInnerHTML={{ __html: jsonToHtml(note.content) }}
            />
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: '0.5px solid #E0DDD8', fontSize: 12, color: '#B0ADA6' }}>
              Shared via Notewise
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
