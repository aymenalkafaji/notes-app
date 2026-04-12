export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', position: 'fixed', inset: 0 }}>
      {children}
    </div>
  )
}