// @ts-check
/* eslint perfectionist/sort-objects: "error" */
import base from '../../eslint.config.mjs'

export default base
  .removeRules(
    'no-labels',
    'no-lone-blocks',
    'no-restricted-syntax',
    'node/prefer-global/buffer',
    'node/prefer-global/process',
    'prefer-rest-params',
    'symbol-description',
    'ts/ban-types',
    'ts/no-empty-object-type',
    'ts/no-invalid-this',
    'ts/no-unnecessary-type-constraint',
  )
  .append({
    ignores: ['tests'],
  })
