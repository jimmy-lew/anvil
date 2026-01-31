import { drizzle } from 'drizzle-orm/libsql'

const { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } = useRuntimeConfig()

export const db = drizzle({ connection: {
  url: TURSO_CONNECTION_URL as string,
  authToken: TURSO_AUTH_TOKEN as string,
} })
