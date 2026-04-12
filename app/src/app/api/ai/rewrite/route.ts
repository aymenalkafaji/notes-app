import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const { content, style } = await req.json()
  if (!content?.trim()) return errorResponse('No content')

  const styleInstructions: Record<string, string> = {
    professional: 'professional and formal',
    casual: 'casual and friendly',
    concise: 'concise and to the point',
    detailed: 'detailed and comprehensive',
    bullet: 'structured with bullet points',
  }

  const tone = styleInstructions[style] ?? 'professional and formal'

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a document formatter. You rewrite text and return it as a JSON document using Tiptap format. You MUST return only raw JSON starting with { - no markdown, no code fences, no explanation.'
        },
        {
          role: 'user',
          content: `Rewrite the following text in a ${tone} tone. Organize it using appropriate structure.

Use these JSON node types to format:
- {"type":"paragraph","content":[{"type":"text","text":"text here"}]}
- {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"heading"}]}
- {"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"subheading"}]}
- {"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"item"}]}]}]}
- {"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"item"}]}]}]}
- {"type":"horizontalRule"}
- For bold: {"type":"text","text":"bold text","marks":[{"type":"bold"}]}

Return this exact structure:
{"type":"doc","content":[...nodes here...]}

Text to rewrite:
${content}`
        }
      ],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  })

  const json = await res.json()
  let text = (json.choices?.[0]?.message?.content ?? '').trim()
  
  // Clean up any markdown fences
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  
  // Extract JSON object
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    text = text.slice(start, end + 1)
  }

  console.log('Rewrite raw:', text.slice(0, 300))

  try {
    const doc = JSON.parse(text)
    if (doc.type === 'doc' && Array.isArray(doc.content)) {
      return Response.json({ doc })
    }
    throw new Error('bad structure')
  } catch {
    // Fallback to plain text
    return Response.json({
      doc: {
        type: 'doc',
        content: text.split('\n').filter(Boolean).map((line: string) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line }]
        }))
      }
    })
  }
}
