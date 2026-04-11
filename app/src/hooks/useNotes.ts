'use client'
import { useState, useCallback } from 'react'
import type { Note } from '@/types'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notes')
      if (!res.ok) throw new Error('Failed to fetch notes')
      const { data } = await res.json()
      setNotes(data ?? [])
    } catch (err) {
      console.error('fetchNotes error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createNote = useCallback(async () => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled' }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to create note: ${text}`)
    }
    const { data } = await res.json()
    return data as Note
  }, [])

  return { notes, loading, fetchNotes, createNote }
}