import { isMainThread } from 'node:worker_threads'
import sleep from 'atomic-sleep'
import { register, registerBeforeExit, unregister } from 'on-exit-leak-free'
import ThreadStream from 'thread-stream'

// Workaround since threadstream does not adequately expose all it's props
interface _ThreadStream {
  ref: () => void
  unref: () => void
  flushSync: () => void
  end: () => void
  once: (...args: any[]) => void
  on: (...args: any[]) => void
  write: (...args: any[]) => void
  closed: boolean
}

function autoEnd(stream: _ThreadStream) {
  stream.ref()
  stream.flushSync()
  stream.end()
  stream.once('close', () => {
    stream.unref()
  })
}

function flush(stream: ThreadStream) {
  stream.flushSync()
}

function ready(stream: _ThreadStream, exit: () => void) {
  process.removeListener('exit', exit)
  stream.unref()
  register(stream, autoEnd)
  registerBeforeExit(stream, flush)
  stream.on('close', () => {
    unregister(stream)
  })
}

export function stream(sync: boolean = false) {
  if (!isMainThread)
    return

  const extension = import.meta.url.endsWith('.ts') ? 'ts' : 'mjs'
  const filename = new URL(`./worker.${extension}`, import.meta.url).href
  const stream = new ThreadStream({ filename, sync }) as unknown as _ThreadStream
  const onExit = () => {
    if (stream.closed)
      return
    stream.flushSync()
    sleep(100)
    stream.end()
  }
  stream.on('ready', () => ready(stream, onExit))
  stream.on('close', () => {
    process.removeListener('exit', onExit)
  })
  process.on('exit', onExit)

  return stream
}
