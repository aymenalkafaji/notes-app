'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { NotesList } from '@/components/notes/NotesList'
import { useNotes } from '@/hooks/useNotes'

export function Sidebar() {
  const router = useRouter()
  const { createNote } = useNotes()
  const [refreshKey, setRefreshKey] = useState(0)

  async function handleNewNote() {
    const note = await createNote()
    setRefreshKey(k => k + 1)
    router.push(`/notes/${note.id}`)
  }

  return (
    <aside className="w-64 h-screen border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="font-semibold text-sm">My Notes</h1>
        <button
          onClick={handleNewNote}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          + New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NotesList
          onSelect={(note) => router.push(`/notes/${note.id}`)}
          refreshKey={refreshKey}
        />
      </div>
    </aside>
  )
}