import type { Writable } from 'node:stream'
import { isMainThread } from 'node:worker_threads'
import sleep from 'atomic-sleep'
// @ts-expect-error No type def available
import * as onExitLeakFree from 'on-exit-leak-free'
import ThreadStream from 'thread-stream'

// Workaround since threadstream does not adequately expose all it's props
interface _ThreadStream extends ThreadStream {
  ref: () => void
  unref: () => void
  flushSync: () => void
  end: () => void
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
  onExitLeakFree.register(stream, autoEnd)
  onExitLeakFree.registerBeforeExit(stream, flush)
  stream.on('close', () => {
    onExitLeakFree.unregister(stream)
  })
}

export function Thread(streams: Writable[] = [], sync: boolean = false): ThreadStream {
  if (!isMainThread)
    // @ts-expect-error Avoids infinite workers spawning, main thread WILL return a value
    return

  const extension = import.meta.url.endsWith('.ts') ? 'ts' : 'mjs'
  const filename = new URL(`./worker.${extension}`, import.meta.url).href
  const stream = new ThreadStream({ filename, sync, workerData: streams }) as unknown as _ThreadStream
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

// export class Thread {
//   private static instance: Thread | null = null
//   private internal: _ThreadStream

//   constructor(sync: boolean = false) {
//     const extension = import.meta.url.endsWith('.ts') ? 'ts' : 'mjs'
//     const filename = new URL(`./worker.${extension}`, import.meta.url).href
//     this.internal = new ThreadStream({ filename, sync }) as unknown as _ThreadStream
//     this.setup()
//   }

//   static getInstance(): Thread {
//     if (!isMainThread)
//       // @ts-expect-error Avoids infinite workers spawning, main thread WILL return a value
//       return
//     if (Thread.instance === null) {
//       Thread.instance = new Thread()
//     }
//     return Thread.instance
//   }

//   onReady() {
//     process.removeListener('exit', this.onExit)
//     this.internal.unref()
//     onExitLeakFree.register(this, this.autoEnd)
//     onExitLeakFree.registerBeforeExit(this, this.internal.flushSync)
//     this.internal.on('close', () => {
//       onExitLeakFree.unregister(this)
//     })
//   }

//   onExit() {
//     if (this.internal.closed)
//       return
//     this.internal.flushSync()
//     sleep(100)
//     this.internal.end()
//   }

//   autoEnd() {
//     this.internal.ref()
//     this.internal.flushSync()
//     this.internal.end()
//     this.internal.once('close', () => {
//       this.internal.unref()
//     })
//   }

//   setup() {
//     this.internal.on('ready', this.onReady)
//     this.internal.on('close', () => {
//       process.removeListener('exit', this.onExit)
//     })
//     process.on('exit', this.onExit)
//   }

//   write(data: any) {
//     this.internal.write(data)
//   }
// }
