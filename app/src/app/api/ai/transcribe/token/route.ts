import { requireAuth } from '@/lib/auth/guards'
import { errorResponse } from '@/lib/utils/api'

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!

export async function POST() {
  const { error } = await requireAuth()
  if (error) return error

  // Get the first project ID
  const projectsRes = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
  })
  if (!projectsRes.ok) return errorResponse('Deepgram project fetch failed')
  const { projects } = await projectsRes.json()
  const projectId = projects?.[0]?.project_id
  if (!projectId) return errorResponse('No Deepgram project found')

  // Create a short-lived key the browser can use directly
  const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: 'notewise-realtime',
      scopes: ['usage:write'],
      time_to_live_in_seconds: 7200,
    }),
  })
  if (!keyRes.ok) return errorResponse('Failed to create Deepgram token')
  const { key } = await keyRes.json()

  return Response.json({ key })
}
