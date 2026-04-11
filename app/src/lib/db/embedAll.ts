import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  })
  const data = await res.json()
  return data.embedding
}

async function main() {
  const notes = await sql`
    SELECT id, title, content_text, content 
    FROM notes 
    WHERE embedding IS NULL
  `

  console.log(`Found ${notes.length} notes to embed`)

  for (const note of notes) {
    const text = note.content_text || note.title || ''
    if (!text.trim()) {
      console.log(`Skipping note ${note.id} — no content`)
      continue
    }

    try {
      const embedding = await getEmbedding(text)
      await sql`
        UPDATE notes 
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE id = ${note.id}
      `
      console.log(`Embedded: ${note.title || 'Untitled'}`)
    } catch (err) {
      console.error(`Failed for note ${note.id}:`, err)
    }
  }

  console.log('Done!')
  await sql.end()
}

main()