import base from '@anvil/eslint'

export default base.removeRules(
  'antfu/top-level-function',
  'node/prefer-global/process',
  'unicorn/throw-new-error',
)
