import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const { content } = await req.json()
  if (!content?.trim()) return errorResponse('No content to summarize')

  const res = await fetch('http://host.docker.internal:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: `Summarize the following note in 3-4 concise sentences. Focus on key ideas only. Note:\n\n${content}`,
      stream: true,
    }),
  })

  if (!res.ok) return errorResponse('Ollama not running')

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.response) {
              controller.enqueue(new TextEncoder().encode(data.response))
            }
          } catch {}
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}