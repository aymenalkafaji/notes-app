import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const formData = await req.formData()
  const audio = formData.get('audio') as Blob | null
  if (!audio) return errorResponse('No audio provided')

  const groqForm = new FormData()
  groqForm.append('file', audio, 'recording.webm')
  groqForm.append('model', 'whisper-large-v3')
  groqForm.append('response_format', 'json')
  groqForm.append('language', 'en')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: groqForm,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Groq Whisper error:', err)
    return errorResponse('Transcription failed')
  }

  const json = await res.json()
  return Response.json({ text: json.text ?? '' })
}
