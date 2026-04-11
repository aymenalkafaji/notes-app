'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useNotes } from '@/hooks/useNotes'
import type { Note } from '@/types'

interface NotesListProps {
  onSelect: (note: Note) => void
  refreshKey?: number
}

export function NotesList({ onSelect, refreshKey }: NotesListProps) {
  const { notes, loading, fetchNotes } = useNotes()
  const pathname = usePathname()

  useEffect(() => { fetchNotes() }, [fetchNotes, refreshKey])

  if (loading) return <div className="p-4 text-sm text-gray-400">Loading...</div>
  if (notes.length === 0) return (
    <div className="p-4 text-sm text-gray-400">
      No notes yet — click + New to start
    </div>
  )

  return (
    <ul className="flex flex-col gap-1 p-2">
      {notes.map((note) => {
        const isActive = pathname === `/notes/${note.id}`
        return (
          <li key={note.id}>
            <button
              onClick={() => onSelect(note)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-sm font-medium truncate">
                {note.title || 'Untitled'}
              </div>
              <div className={`text-xs mt-0.5 ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}