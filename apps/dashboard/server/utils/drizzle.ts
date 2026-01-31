import { drizzle } from 'drizzle-orm/libsql'

const { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } = useRuntimeConfig()

const db = drizzle({ connection: {
  url: TURSO_CONNECTION_URL!,
  authToken: TURSO_AUTH_TOKEN!,
} })

export function useDrizzle() {
  return db
}
