'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
      <div style={{ background: '#FDFBF8', padding: '40px 36px', borderRadius: 20, border: '0.5px solid #E0DDD8', width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#E8C9A0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>
          📝
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1C1A17', fontFamily: 'Georgia, serif', letterSpacing: '-0.3px', marginBottom: 6 }}>
          Notewise
        </h1>
        <p style={{ fontSize: 14, color: '#9C9890', marginBottom: 32 }}>
          Your AI-powered second brain
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/notes' })}
          style={{ width: '100%', padding: '12px', background: '#D4956A', border: 'none', borderRadius: 10, color: '#FFF8F2', fontSize: 14, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.01em' }}
        >
          Continue with Google
        </button>
        <p style={{ fontSize: 12, color: '#B0ADA6', marginTop: 20 }}>
          Your notes are private and secure
        </p>
      </div>
    </div>
  )
}