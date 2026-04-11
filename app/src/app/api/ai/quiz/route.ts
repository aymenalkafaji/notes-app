import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'
import { z } from 'zod'

const QuizSchema = z.object({
  cards: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
})

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const { content } = await req.json()
  if (!content?.trim()) return errorResponse('No content to generate quiz from')

  const res = await fetch('http://host.docker.internal:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: `Generate 5 flashcards from the following note.
Return ONLY a JSON object, no markdown, no backticks, no explanation.
Format: {"cards": [{"question": "...", "answer": "..."}]}

Note:
${content}`,
      stream: false,
    }),
  })

  if (!res.ok) return errorResponse('Ollama not running')

  const data = await res.json()
  const text = data.response ?? ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return errorResponse('Could not parse response')
    const parsed = QuizSchema.parse(JSON.parse(jsonMatch[0]))
    return Response.json({ data: parsed })
  } catch {
    return errorResponse('Failed to parse quiz response')
  }
}