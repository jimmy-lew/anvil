<script setup lang="ts">
interface GithubAPICommitResponse {
  sha: string
  node_id: string
}

const { locale, t } = useInternalI18n()

const { data } = useFetch<GithubAPICommitResponse[]>('https://api.github.com/repos/jimmy-lew/anvil/commits?per_page=1')
const memberCount = ref(0)
const isHovered = ref(false)

onMounted(() => {
  memberCount.value = 122
})
</script>

<template>
  <div class="flex justify-center items-center gap-2">
    <UButton :to="`/${locale}/getting-started/introduction`" icon="lucide-book" variant="outline" color="neutral">
      Docs
    </UButton>
    <UButton
      to="https://discord.gg/Xgg5ZNBBvu"
      target="_blank"
      variant="outline"
      color="neutral"
      class="relative"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      Join the Smithy!
      <Motion
        :initial="{ opacity: 0, scale: 0.8, y: 10 }"
        :animate="isHovered
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.8, y: 10 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        class="absolute w-full left-1/2 -translate-x-1/2 -top-full mt-2 flex items-center justify-center gap-1 text-green-400"
      >
        <UIcon name="lucide-circle-user-round" />
        {{ memberCount }} members
      </Motion>
    </UButton>
    <UButton to="https://github.com/jimmy-lew/anvil/tree/main" target="_blank" variant="outline" color="neutral">
      <UIcon name="lucide-square-arrow-out-up-right" />
      main @
      <span class="text-muted">
        {{ commitSha }}
      </span>
    </UButton>
  </div>
</template>
