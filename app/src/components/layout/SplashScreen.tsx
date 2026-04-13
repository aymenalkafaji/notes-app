'use client'
import { useState, useEffect } from 'react'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Only show on first visit per session
    if (sessionStorage.getItem('splashShown')) {
      setVisible(false)
      return
    }
    const fadeTimer = setTimeout(() => setFading(true), 1200)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('splashShown', '1')
    }, 1900)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: fading ? 'none' : 'all',
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'splashReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          fontFamily: 'Fraunces, Georgia, serif',
          letterSpacing: '-1px',
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: 12,
        }}>
          Note<span style={{ color: 'var(--accent)' }}>wise</span>
        </div>
        <div style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          fontFamily: 'DM Sans, sans-serif',
          letterSpacing: '0.05em',
          animation: 'splashReveal 0.8s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
          Collaborate. Think. Create.
        </div>
      </div>
      <style>{`
        @keyframes splashReveal {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
