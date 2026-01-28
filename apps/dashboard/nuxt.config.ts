import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
  },

  alias: {
    '@lib': '../../packages',
  },

  devtools: {
    enabled: false,

    timeline: {
      enabled: false,
    },
  },

  devServer: {
    host: '0',
  },

  css: ['~/assets/css/tailwind.css'],
  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    plugins: [
      tailwindcss(),
    ],
    server: {
      strictPort: true,
    },
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    'motion-v/nuxt',
  ],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "~/components/ui"
     */
    componentDir: '~/components/ui',
  },

  icon: {
    customCollections: [
      {
        prefix: 'local',
        dir: './app/assets/icons',
      },
    ],
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  routeRules: {
  },

  imports: {
    dirs: [
      './lib',
      './types',
      '~~/lib',
    ],
  },

  nitro: {
    imports: {
      dirs: [
        'lib',
      ],
    },
  },

  ignore: ['**/src_tauri/**'],

  compatibilityDate: '2026-12-25',
})
