import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const stream = new ReadableStream({
    start(controller) {
      const subscriber = redis.duplicate()

      subscriber.subscribe(`note:${id}`, (err) => {
        if (err) controller.close()
      })

      subscriber.on('message', (_channel, message) => {
        controller.enqueue(`data: ${message}\n\n`)
      })

      req.signal.addEventListener('abort', () => {
        subscriber.unsubscribe()
        subscriber.quit()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}