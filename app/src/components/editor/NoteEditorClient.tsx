'use client'
import { useCallback } from 'react'
import { Editor } from './Editor'

interface Props {
  noteId: string
  initialContent?: object
  initialTitle?: string
}

export function NoteEditorClient({ noteId, initialContent, initialTitle }: Props) {
  const handleTitleChange = useCallback((newTitle: string) => {
    window.dispatchEvent(new CustomEvent('note-title-changed', { detail: { noteId, title: newTitle } }))
  }, [noteId])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Editor
        noteId={noteId}
        initialContent={initialContent}
        initialTitle={initialTitle}
        onTitleChange={handleTitleChange}
      />
    </div>
  )
}