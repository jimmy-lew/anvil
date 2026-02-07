<script setup lang="ts">
import type { Collections, ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'
import { kebabCase } from 'scule'

definePageMeta({
  layout: 'docs',
  header: false,
  footer: false,
})

const route = useRoute()
const { locale } = useInternalI18n()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const routeKey = kebabCase(route.path)

const collectionName = computed<keyof Collections>(() => `docs_${locale.value}`)

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(routeKey, () => queryCollection(collectionName.value).path(route.path).first()),
  useAsyncData(`${routeKey}-surround`, () => { return queryCollectionItemSurroundings(collectionName.value, route.path) }),
])

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

const headline = ref(findPageHeadline(navigation?.value, page.value?.path))
watch(() => navigation?.value, () => {
  headline.value = findPageHeadline(navigation?.value, page.value?.path) || headline.value
})

defineOgImageComponent('Docs', {
  headline: headline.value,
})
</script>

<template>
  <UPage
    v-if="page"
    :key="`page-${page.id}`"
    :ui="{
      root: 'flex flex-col lg:grid lg:grid-cols-10 lg:gap-10',
      left: 'lg:col-span-2',
      center: 'lg:col-span-7',
      right: 'lg:col-span-3 order-first lg:order-last',
    }"
  >
    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <ContentSurround :surround />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <ContentToc :links="page.body?.toc.links" />
    </template>
  </UPage>
</template>
