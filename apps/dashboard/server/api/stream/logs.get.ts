export default defineEventHandler(async (event) => {
  setHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const stream = new ReadableStream({
    start(controller) {
      const listener = (data) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
      }
      logBus.on('log', listener)
      event.node.req.on('close', () => {
        logBus.off('log', listener)
      })
    },
  })

  return stream
})
