export default function NotesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#E8C9A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
        📝
      </div>
      <p style={{ fontSize: 16, fontWeight: 500, color: '#3C3A36', fontFamily: 'Georgia, serif' }}>Select a note to start writing</p>
      <p style={{ fontSize: 13, color: '#B0ADA6' }}>Or click "+ New note" to create one</p>
    </div>
  )
}