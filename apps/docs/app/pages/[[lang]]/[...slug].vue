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
  useAsyncData(`${routeKey}-surround`, () => queryCollectionItemSurroundings(collectionName.value, route.path)),
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
  <DocsHeader />
  <div class="flex items-start gap-10 mx-auto pt-18 px-12 max-w-5xl">
    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <ContentSurround :surround />
    </UPageBody>
    <ContentToc v-if="page?.body?.toc" :links="page.body?.toc.links" />
  </div>
</template>
