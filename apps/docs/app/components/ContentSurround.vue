<script setup lang="ts">
import type { ContentSurroundLink } from '@nuxt/ui'

defineProps<{
  surround?: ContentSurroundLink[]
}>()
</script>

<template>
  <div v-if="surround" class="flex gap-6">
    <ULink
      v-if="surround[0]"
      :to="surround[0].path"
      class="w-full grow block p-4 rounded-lg border border-default hover:bg-elevated/50 focus-visible:outline-primary transition-colors text-left"
    >
      <span class="text-sm mb-2">
        Prev <UIcon name="lucide-chevron-left" />
      </span>
      <p class="font-medium text-[15px] text-highlighted mb-1 truncate">
        {{ surround[0].title }}
      </p>
    </ULink>
    <ULink
      v-if="surround[1]"
      :to="surround[1].path"
      class="w-full grow block p-4 rounded-lg border border-default hover:bg-elevated/50 focus-visible:outline-primary transition-colors text-right"
    >
      <span class="text-sm mb-2">
        Next <UIcon name="lucide-chevron-right" />
      </span>
      <p class="font-medium text-[15px] text-highlighted mb-1 truncate">
        {{ surround[1].title }}
      </p>
    </ULink>
  </div>
</template>
