import type { Writable } from 'node:stream'

export interface StreamEntry {
  stream: Writable
  level?: number | string
}

interface InternalStream {
  stream: any
  level: number
  id: number
}

export interface MultiStream {
  write: (data: any) => void
  add: (dest: StreamEntry | Writable) => MultiStream
  remove: (id: number) => MultiStream
  emit: (event: string | symbol, ...args: any[]) => void
  flushSync: () => void
  end: () => void
  streams: InternalStream[]
  // Internal Pino tracking properties
  lastLevel?: number
  lastTime?: string
  lastMsg?: string
  lastObj?: any
  lastLogger?: any
}

export function multistream(
  rawStreams: (StreamEntry | Writable)[] = [],
): MultiStream {
  const res: MultiStream = {
    streams: [],

    write(data: any) {
      const { streams } = this
      const level = this.lastLevel ?? 0
      for (const dest of streams) {
        if (dest.level > level)
          continue
        writeToStream(dest.stream, data, this, level)
      }
    },

    add(dest: StreamEntry | any) {
      if (!dest)
        return this

      const stream_ = dest.write ? dest : dest.stream
      if (typeof stream_?.write !== 'function') {
        throw new TypeError('stream object needs to implement either StreamEntry or DestinationStream interface')
      }

      const level = 10

      const entry: InternalStream = {
        stream: stream_,
        level,
        id: ++(this as any).lastId || ((this as any).lastId = 1),
      }

      this.streams.push(entry)

      return this
    },

    remove(id: number) {
      const index = this.streams.findIndex(s => s.id === id)
      if (index >= 0) {
        this.streams.splice(index, 1)
      }
      return this
    },

    emit(event, ...args) {
      for (const { stream } of this.streams) {
        if (typeof stream.emit === 'function')
          stream.emit(event, ...args)
      }
    },

    flushSync() {
      for (const { stream } of this.streams) {
        if (typeof stream.flushSync === 'function')
          stream.flushSync()
      }
    },

    end() {
      for (const { stream } of this.streams) {
        if (typeof stream.flushSync === 'function')
          stream.flushSync()
        if (typeof stream.end === 'function')
          stream.end()
      }
    },
  }

  rawStreams.forEach(res.add)
  return res
}

/**
 * Internal helper to pass pino metadata down to sub-streams
 */
function writeToStream(dest: any, data: any, parent: MultiStream, level: number) {
  dest.lastLevel = level
  dest.lastTime = parent.lastTime
  dest.lastMsg = parent.lastMsg
  dest.lastObj = parent.lastObj
  dest.lastLogger = parent.lastLogger
  dest.write(data)
}

export default multistream
