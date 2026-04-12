import { requireAuth } from '@/lib/auth/guards'
import { errorResponse, successResponse } from '@/lib/utils/api'

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
      messages: [{ role: 'user', content: `Generate 5 flashcard questions and answers based on the following note. Return ONLY valid JSON with no markdown, no code blocks, no extra text.\n\nFormat: {"cards": [{"question": "...", "answer": "..."}, ...]}\n\nNote:\n${content}` }],
      max_tokens: 1024,
    }),
  })
  const json = await res.json()
  const text = (json.choices?.[0]?.message?.content ?? '').trim().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()

  try {
    const data = JSON.parse(text)
    return successResponse(data)
  } catch {
    return errorResponse('Failed to parse quiz response')
  }
}
