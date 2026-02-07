<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContentNavigation
    highlight
    trailing-icon="lucide-chevron-right"
    :default-open="false"
    :navigation="navigation"
    :ui="{
      listWithChildren: 'ms-0 border-none',
      item: 'ps-0 ms-0',
      linkTrailingIcon: 'group-data-[state=open]:rotate-90',
    }"
  />
</template>
