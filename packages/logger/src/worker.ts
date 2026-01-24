import { LogStream } from './stream'
import { FileTransport, TcpTransport } from './transports'

const isDev = process.env.NODE_ENV === 'dev'

export default async function () {
  const file = new FileTransport()
  const tcp = new TcpTransport()
  const streams: any[] = [
    file,
    tcp,
    isDev ? process.stdout : null,
  ]
  const stream = new LogStream(...streams)
  return stream
}
