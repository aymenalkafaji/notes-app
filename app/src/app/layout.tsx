import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notewise',
  description: 'Your AI-powered second brain',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%', width: '100%' }}>
      <body style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}