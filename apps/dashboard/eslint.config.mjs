import base from '../../eslint.config.mjs'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  base.append({
    rules: {
      // Allow trailing space in comments, for possible JSDoc formattings
      'style/no-trailing-spaces': ['error', { ignoreComments: true }],
      // Relaxes inline statements a bit
      'style/max-statements-per-line': ['error', { max: 2 }],
    },
  }),
)
