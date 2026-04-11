'use client'
import { useCallback, useRef } from 'react'

export function useAutoSave(fn: (data: unknown) => Promise<void>, delay = 1000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback((data: unknown) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(data), delay)
  }, [fn, delay])

  return save
}