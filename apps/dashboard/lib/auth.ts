import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, magicLink } from 'better-auth/plugins'
import * as schema from '~~/db/schema'
import { db } from './db'

const { BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID } = useRuntimeConfig()

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL as string,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
    },
    discord: {
      clientId: DISCORD_CLIENT_ID as string,
      clientSecret: DISCORD_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, ctx) => {
        // TODO: Integrate with email sending, currently thinking of using resend, but since it's a relatively small app might just use nodemailer with personal email
      },
    }),
  ],
})
