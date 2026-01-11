import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import build from 'pino-abstract-transport'

export interface TursoTransportOpts {
  url: string
  token: string
  table: SQLiteTable
}

export default async function (opts: TursoTransportOpts) {
  const turso = createClient({
    url: opts.url,
    authToken: opts.token,
  })
  const db = drizzle(turso)

  return build(async (stream) => {
    stream.on('data', async (chunk) => {
      await db.insert(opts.table).values(chunk).run()
    })
  }, {
    async close() {
      turso.close()
    },
    parseLine(line) {
      return JSON.parse(line)
    },
  })
}
