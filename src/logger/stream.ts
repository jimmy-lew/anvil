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
  stream.once('close', () => { stream.unref() })
}

function flush(stream: ThreadStream) {
  stream.flushSync()
}

function exit(stream: _ThreadStream) {
  return () => {
    if (stream.closed)
      return
    stream.flushSync()
    sleep(100)
    stream.end()
  }
}

function ready(stream: _ThreadStream, exit: () => void) {
  process.removeListener('exit', exit)
  stream.unref()
}

export function stream() {
  const extension = import.meta.url.endsWith('.ts') ? 'ts' : 'mjs'
  const filename = new URL(`./worker.${extension}`, import.meta.url).href
  const stream = new ThreadStream({ filename }) as unknown as _ThreadStream
  const _exit = exit(stream)

  stream.on('ready', () => ready(stream, _exit))
  register(stream, autoEnd)
  registerBeforeExit(stream, flush)
  stream.on('close', () => { unregister(stream) })
  stream.on('close', () => { process.removeListener('exit', _exit) })
  process.on('exit', _exit)

  return stream
}
