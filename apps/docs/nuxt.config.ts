import { createResolver, extendViteConfig, useNuxt } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    resolve('./modules/config'),
    resolve('./modules/routing'),
    resolve('./modules/css'),
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxtjs/robots',
    'nuxt-og-image',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    () => {
      // Update @nuxt/content optimizeDeps options
      extendViteConfig((config) => {
        config.optimizeDeps ||= {}
        config.optimizeDeps.include ||= []
        config.optimizeDeps.include.push('@nuxt/content > slugify')
        config.optimizeDeps.include = config.optimizeDeps.include
          .map(id => id.replace(/^@nuxt\/content > /, 'docus > @nuxt/content > '))
      })
    },
  ],
  css: ['~/assets/css/main.css'],
  i18n: {
    defaultLocale: 'en',
    locales: [{
      code: 'en',
      name: 'English',
    }, {
      code: 'fr',
      name: 'Français',
    }],
    strategy: 'prefix',
  },
  hooks: {
    'nitro:config': function (config) {
      const nuxt = useNuxt()
      // Defensive assignment - Ensures the appropriate properties are set
      config.prerender = config.prerender || {}
      config.prerender.routes = config.prerender.routes || []

      const i18nOptions = nuxt.options.i18n

      const localeRouteMapper = (locale: string | { code: string }) => typeof locale === 'string' ? `/${locale}` : `/${locale.code}`
      config.prerender.routes.push(...(i18nOptions.locales?.map(localeRouteMapper) || []))
      config.prerender.routes.push('/sitemap.xml')
    },
  },
})
