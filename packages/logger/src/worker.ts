import { LogStream } from './stream'
import { FileTransport } from './transports'

const isDev = process.env.NODE_ENV === 'dev'

export default async function () {
  const file = new FileTransport()
  const streams: any[] = [
    file,
    isDev ? process.stdout : null,
  ]
  const stream = new LogStream(...streams)
  return stream
}
