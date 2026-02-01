export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    'motion-v/nuxt',
  ],
  extends: ['docus'],
  css: ['~/assets/css/main.css'],
  i18n: {
    defaultLocale: 'en',
    locales: [{
      code: 'en',
      name: 'English',
    }, {
      code: 'fr',
      name: 'Français',
    }, {
      code: 'zh-CN',
      name: '中文',
    }],
  },
})
