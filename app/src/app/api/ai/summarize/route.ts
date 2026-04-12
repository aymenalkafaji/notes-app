import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const { content } = await req.json()
  if (!content?.trim()) return errorResponse('No content')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `Summarize the following note in 3-5 clear sentences. Focus on key points only.\n\n${content}` }],
      max_tokens: 512,
    }),
  })
  const json = await res.json()
  const text = json.choices?.[0]?.message?.content ?? ''

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
