import { adminClient, magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export function useAuth() {
  const url = useRequestURL()

  const client = createAuthClient({
    baseURL: url.origin,
    plugins: [
      adminClient(),
      magicLinkClient(),
    ],
  })
  const { signIn, signOut, signUp } = client

  return { signIn, signOut, signUp }
}
