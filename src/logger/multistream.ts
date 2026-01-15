import type { Writable } from 'node:stream'

export interface StreamEntry {
  stream: Writable
  level?: number | string
  levelVal?: number
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
      for (const dest of streams) {
        dest.stream.write(data)
      }
    },

    add(dest: StreamEntry | any) {
      if (!dest)
        return this

      const stream_ = dest.write ? dest : dest.stream
      if (typeof stream_?.write !== 'function') {
        throw new TypeError('stream object needs to implement either StreamEntry or DestinationStream interface')
      }

      const entry: InternalStream = {
        stream: stream_,
        level: 10,
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
        stream.emit(event, ...args)
      }
    },

    flushSync() {
      for (const { stream } of this.streams) {
        stream.flushSync()
      }
    },

    end() {
      for (const { stream } of this.streams) {
        stream.flushSync()
        stream.end()
      }
    },
  }

  rawStreams.forEach(s => res.add(s))
  return res
}

export default multistream
