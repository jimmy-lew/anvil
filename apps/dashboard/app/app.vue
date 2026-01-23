<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const colorMode = useColorMode()
const color = computed(() =>
  colorMode.value === 'dark' ? '#09090b' : '#ffffff',
)
const { theme } = useAppSettings()

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [{ rel: 'icon', href: '/favicon.png' }],
  htmlAttrs: {
    lang: 'en',
  },
  bodyAttrs: {
    class: computed(
      () =>
        `color-${theme.value?.color || 'default'} theme-${theme.value?.type || 'default'}`,
    ),
  },
})

const title = 'Anvil Dashboard'
const description = ''

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: '',
  ogImage: '',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: '',
  twitterCard: 'summary_large_image',
})

const router = useRouter()

defineShortcuts({
  'G-H': () => router.push('/'),
})

const textDirection = useTextDirection({ initialValue: 'ltr' })
const dir = computed(() => (textDirection.value === 'rtl' ? 'rtl' : 'ltr'))

useLogs()
</script>

<template>
  <Body class="overscroll-none antialiased bg-background text-foreground">
    <ConfigProvider :dir="dir">
      <div id="app" vaul-drawer-wrapper class="relative">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>

      <Toaster :theme="(colorMode.preference as any) || 'system'" />
    </ConfigProvider>
  </Body>
</template>
