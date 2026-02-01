<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

interface GithubAPICommitResponse {
  sha: string
  node_id: string
}

const { data } = useFetch<GithubAPICommitResponse[]>('https://api.github.com/repos/jimmy-lew/anvil/commits?per_page=1')
const memberCount = ref(0)
const commitSha = ref(data.value?.at(0)?.sha.substring(0, 6) ?? '006fa8')

onMounted(() => {
  memberCount.value = 122
})
</script>

<template>
  <div class="flex justify-center items-center gap-2 pb-8">
    <UButton icon="lucide-book" variant="outline" color="neutral">
      Docs
    </UButton>
    <UButton to="https://discord.gg/Ew7Tgr3" target="_blank" variant="outline" color="neutral" class="relative">
      Join the Smithy!
      <div class="absolute top-full left-2 mt-1 flex items-center justify-center gap-1 text-green-400">
        <UIcon name="lucide-circle-user-round" />
        <NumberFlow :value="memberCount" /> members
      </div>
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
