<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UMain>
    <div class="pl-72">
      <div class="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:max-h-screen w-72 border-r border-default">
        <DocsAsideHeader />
        <div class="flex grow flex-col overflow-hidden relative">
          <div class="grow min-h-0">
            <div class="h-full relative overflow-hidden">
              <div class="pt-4 pb-16 scroll-pt-4 scroll-pb-16 mask h-full overflow-x-hidden overflow-y-scroll">
                <UContentNavigation
                  highlight
                  trailing-icon="lucide-chevron-right"
                  :navigation="navigation"
                  :ui="{
                    list: 'mx-5 mt-0',
                    listWithChildren: 'ms-0 border-none',
                    item: 'ps-0 ms-0',
                    linkTitle: 'font-medium',
                    linkTrailingIcon: 'size-3.5 group-data-[state=open]:rotate-90',
                  }"
                />
              </div>
            </div>
          </div>
          <DocsAsideFooter />
        </div>
      </div>
      <slot />
    </div>
  </UMain>
</template>

<style>
.mask {
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #0003 10px,
    black 20px,
    black calc(100% - 64px),
    #0003 calc(100% - calc(64px / 2)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #0003 10px,
    black 20px,
    black calc(100% - 64px),
    #0003 calc(100% - calc(64px / 2)),
    transparent 100%
  );
}
</style>
