<script setup lang="ts">
type OsType = 'Windows' | 'macOS' | 'Linux'
const clientOS = ref<OsType>('Windows')
const betaOptIn = ref(false)

const osMap: Record<OsType, string> = {
  Windows: 'iwr -useb https://nvil.dev/install.ps1 | iex',
  Linux: 'curl -fsSL https://nvil.dev/install.sh | bash',
  macOS: 'curl -fsSL https://nvil.dev/install.sh | bash',
}

const installCmd = computed(() => {
  const baseCmd = osMap[clientOS.value]
  if (!betaOptIn.value) {
    return baseCmd
  }
  const betaSuffix = clientOS.value === 'Windows' ? '--beta' : '-s -- --beta'
  return `${baseCmd} ${betaSuffix}`
})

function getClientOS(): OsType {
  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.includes('mac'))
    return 'macOS'
  if (userAgent.includes('linux'))
    return 'Linux'
  return 'Windows'
}

function toggleOs() {
  if (clientOS.value === 'Windows') {
    clientOS.value = 'Linux'
    return
  }
  clientOS.value = 'Windows'
}

function toggleBeta() {
  betaOptIn.value = !betaOptIn.value
}

const { copy, copied } = useClipboard()

onMounted(() => {
  clientOS.value = getClientOS()
})
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="border border-accented rounded-xl w-180 font-mono">
      <div class="flex items-center justify-end px-4 py-3 text-xs gap-2 border-b border-accented">
        {{ clientOS === 'Windows' ? 'Windows' : 'macOS/Linux' }}
        <UButton variant="link" class="text-xs" @click="toggleOs">
          change
        </UButton>
        <UButton variant="outline" :color="betaOptIn ? 'primary' : 'neutral'" class="text-xs" @click="toggleBeta">
          <UIcon name="mdi:beta" />
          LTS
        </UButton>
      </div>
      <div class="flex justify-between px-4 py-3 text-sm">
        <div class="inline-flex items-center gap-2">
          <span class="text-primary">$</span>
          {{ installCmd }}
        </div>
        <UButton :icon="copied ? 'lucide-check' : 'lucide-copy'" :color="copied ? 'primary' : 'neutral'" variant="outline" size="sm" @click="copy(installCmd)" />
      </div>
    </div>
  </div>
</template>
