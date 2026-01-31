import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, magicLink } from 'better-auth/plugins'
import * as schema from '~~/db/schema'
import { db } from './db'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
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
