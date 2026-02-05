<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContentNavigation
    highlight
    :navigation="navigation"
    :ui="{
      listWithChildren: 'm-0 border-none',
      item: 'ms-0 ps-0',
    }"
  />
</template>
