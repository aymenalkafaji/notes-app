'use client'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Editor } from './Editor'
import { PresenceAvatars, CurrentUserBubble, NamePrompt } from './PresenceAvatars'
import { updateCursors } from './CollabCursor'
import type { CursorUser } from './CollabCursor'

interface Props {
  noteId: string
  initialContent?: object
  initialTitle?: string
}

export function NoteEditorClient({ noteId, initialContent, initialTitle }: Props) {
  const [userName, setUserName] = useState<string | null>(null)
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const editorRef = useRef<any>(null)
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return 'ssr'
    let id = localStorage.getItem('notewise-uid')
    if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem('notewise-uid', id) }
    return id
  })

  useEffect(() => {
    const saved = localStorage.getItem('notewise-name')
    if (saved) setUserName(saved)
    else setShowNamePrompt(true)
  }, [])

  useEffect(() => {
    if (!userName) return
    const timer = setTimeout(() => {
      ;(window as any).__presenceInfo = { noteId, currentUser: { id: userId, name: userName } }
      window.dispatchEvent(new Event('presence-info'))
    }, 200)
    return () => clearTimeout(timer)
  }, [noteId, userName, userId])

  const handleTitleChange = useCallback((newTitle: string) => {
    window.dispatchEvent(new CustomEvent('note-title-changed', { detail: { noteId, title: newTitle } }))
  }, [noteId])

  const sendCursorPosition = useCallback(async (anchor: number, head: number) => {
    if (!userName || !userId) return
    await fetch(`/api/notes/${noteId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, userId, anchor, head }),
    }).catch(() => {})
  }, [noteId, userName, userId])

  const handleSelectionUpdate = useCallback(({ editor }: any) => {
    editorRef.current = editor
    const { anchor, head } = editor.state.selection
    sendCursorPosition(anchor, head)
  }, [sendCursorPosition])

  const handleEditorReady = useCallback((editor: any) => {
    editorRef.current = editor
  }, [])

  const handleCursorUpdate = useCallback((users: CursorUser[]) => {
    if (editorRef.current) {
      updateCursors(editorRef.current, users)
    }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { noteId: eventNoteId, users } = (e as CustomEvent).detail
      if (eventNoteId !== noteId || !editorRef.current) return
      updateCursors(editorRef.current, users)
    }
    window.addEventListener('collab-cursor-update', handler)
    return () => window.removeEventListener('collab-cursor-update', handler)
  }, [noteId])

  function handleNameSubmit(name: string) {
    localStorage.setItem('notewise-name', name)
    setUserName(name)
    setShowNamePrompt(false)
  }

  if (showNamePrompt || !userName) return <NamePrompt onSubmit={handleNameSubmit} />

  const currentUser = { id: userId, name: userName }
  const presenceSlot = (
    <PresenceAvatars 
      noteId={noteId} 
      currentUser={currentUser} 
      onCursorUpdate={handleCursorUpdate}
    />
  )
  const currentUserSlot = <CurrentUserBubble name={userName} onChangeName={() => setShowNamePrompt(true)} />

  return (
    <Editor
      noteId={noteId}
      initialContent={initialContent}
      initialTitle={initialTitle}
      onTitleChange={handleTitleChange}
      onSelectionUpdate={handleSelectionUpdate}
      onEditorReady={handleEditorReady}
      presenceSlot={presenceSlot}
      currentUserSlot={currentUserSlot}
    />
  )
}
