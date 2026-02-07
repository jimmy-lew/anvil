<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

interface Props {
  links?: TocLink[]
  highlight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlight: true,
})

const router = useRouter()
const activeHeading = ref<string>('')
const linkRefs = ref<Map<string, HTMLElement>>(new Map())

const defaultIndicatorStyle = { '--indicator-position': '0px', '--indicator-height': '28px' }

const [DefineListTemplate, ReuseListTemplate] = createReusableTemplate<{
  links: TocLink[]
  level: number
}>()

const { y: scrollY } = useWindowScroll()

function flattenLinks(links: TocLink[]): TocLink[] {
  return links.flatMap(link => [link, ...(link.children ? flattenLinks(link.children) : [])])
}

const indicatorStyle = computed(() => {
  if (!activeHeading.value || !props.links)
    return defaultIndicatorStyle

  const flatLinks = flattenLinks(props.links)
  const activeIndex = flatLinks.findIndex(link => link.id === activeHeading.value)

  if (activeIndex < 0)
    return defaultIndicatorStyle

  const cumulativeOffset = flatLinks.reduce((prev, curr, i) => {
    return i >= activeIndex ? prev : prev + (linkRefs.value.get(curr.id)?.offsetHeight ?? 0)
  }, 0)

  const activeLinkElement = linkRefs.value.get(activeHeading.value)
  const activeHeight = activeLinkElement ? activeLinkElement.offsetHeight : 28

  return {
    '--indicator-position': `${cumulativeOffset}px`,
    '--indicator-height': `${activeHeight}px`,
  }
})

function scrollToHeading(id: string) {
  router.push(`#${encodeURIComponent(id)}`)
}

function setLinkRef(id: string, el: HTMLElement | null) {
  if (el) {
    linkRefs.value.set(id, el)
  }
  else {
    linkRefs.value.delete(id)
  }
}

function updateActiveHeading() {
  if (!props.links || props.links.length === 0)
    return

  const headingElements = flattenLinks(props.links)
    .map(link => document.getElementById(link.id))
    .filter((el): el is HTMLElement => el !== null)

  if (headingElements.length === 0)
    return

  const isAtBottom = window.innerHeight + scrollY.value >= document.documentElement.scrollHeight - 1
  if (isAtBottom) {
    activeHeading.value = headingElements[headingElements.length - 1]?.id ?? ''
    return
  }

  const threshold = window.innerHeight * 0.3
  const scrollPosition = scrollY.value + threshold

  let closestHeading = headingElements[0]
  if (!closestHeading)
    return

  let closestDistance = Math.abs(closestHeading.offsetTop - scrollPosition)

  for (const heading of headingElements) {
    const headingTop = heading.offsetTop
    if (headingTop > scrollPosition)
      continue
    const distance = scrollPosition - headingTop
    if (distance > closestDistance)
      continue
    closestDistance = distance
    closestHeading = heading
  }

  activeHeading.value = closestHeading.id
}

watch(scrollY, updateActiveHeading)
onMounted(() => {
  updateActiveHeading()
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-template-shadow -->
  <DefineListTemplate v-slot="{ links, level }">
    <ul :class="level > 0 ? 'ms-3' : 'min-w-0 ml-2.5 pl-4 border-s border-default'">
      <li v-for="link in links" :key="link.id" class="min-w-0">
        <a
          :ref="(el) => setLinkRef(link.id, el as HTMLElement)"
          :href="`#${link.id}`"
          class="group relative text-sm flex items-center py-1 transition-colors -ml-px"
          :class="activeHeading === link.id ? 'text-highlighted' : 'text-muted hover:text-default'"
          @click.prevent="scrollToHeading(link.id)"
        >
          <span class="text-wrap">{{ link.text }}</span>
        </a>

        <ReuseListTemplate
          v-if="link.children?.length"
          :links="link.children"
          :level="level + 1"
        />
      </li>
    </ul>
  </DefineListTemplate>

  <nav v-bind="{ ...$attrs }" class="sticky top-(--ui-header-height) z-10 bg-default/75 lg:bg-[initial] backdrop-blur -mx-4 px-4 sm:px-6 sm:-mx-6 overflow-y-auto max-h-[calc(100vh-var(--ui-header-height))]">
    <div class="pt-4 pb-2.5 border-b border-dashed border-gray-200 flex flex-col lg:py-8 lg:border-0">
      <template v-if="links?.length">
        <div class="hidden lg:block relative">
          <div
            v-if="highlight"
            class="absolute ms-2.5 bg-white transition-[translate,height] duration-200 h-(--indicator-height) translate-y-(--indicator-position) w-px rounded-full"
            :style="indicatorStyle"
          />
          <ReuseListTemplate :links="links" :level="0" />
        </div>
      </template>
    </div>
  </nav>
</template>
