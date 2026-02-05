import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'routing',
  },
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // nuxt.hook('imports:extend', (imports) => {
    //   if (imports.some(i => i.name === 'useInternalI18n'))
    //     return

    //   imports.push({
    //     name: 'useInternalI18n',
    //     from: resolve('../app/composables/useInternalI18n'),
    //   })
    // })

    extendPages((pages) => {
      const landingTemplate = resolve('../app/templates/landing.vue')
      pages.push({
        name: 'lang-index',
        path: '/:lang?',
        file: landingTemplate,
      })
    })
  },
})
