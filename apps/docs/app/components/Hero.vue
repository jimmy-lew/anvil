<script setup lang="ts">
const pageLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    pageLoaded.value = true
  }, 500)
})
</script>

<template>
  <div class="relative isolate">
    <div class="w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-24 sm:py-32 lg:py-40 gap-16 sm:gap-y-24">
      <div class="text-center">
        <div class="relative inline-block">
          <Motion
            v-if="pageLoaded"
            :initial="{ y: -130, x: 50, rotate: 25, opacity: 1 }"
            :animate="{ rotate: -45 }"
            :transition="{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
            }"
            class="absolute -top-10 -right-10 origin-[155px_180px] z-10 pointer-events-none"
          >
            <svg
              width="62"
              height="96"
              viewBox="0 0 310 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="15" width="290" height="166" rx="30" fill="white" />
              <rect x="123" width="64" height="460" rx="19" fill="white" />
            </svg>
          </Motion>

          <Motion
            :initial="{ y: 0 }"
            :animate="pageLoaded ? {
              y: [0, 8, -4, 0],
            } : { y: 0 }"
            :transition="{
              duration: 0.8,
              delay: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
              times: [0, 0.3, 0.6, 1],
            }"
          >
            <h1 class="text-5xl sm:text-7xl text-pretty tracking-tight font-bold text-highlighted font-header relative">
              <slot name="title">
                Forge fanatically.
              </slot>
            </h1>
          </Motion>
        </div>
        <div class="text-lg sm:text-xl/8 text-muted text-balanced mt-6">
          <slot name="description">
            <ProseP>
              Create mods with extreme ease and flexibility
            </ProseP>
            <ProseP>
              Anvil brings the best of the Hytale modding ecosystem into one app.
            </ProseP>
          </slot>
        </div>
        <div class="mt-6 flex flex-col items-center justify-center gap-6">
          <HeroLinks />
          <AppInstallation />
        </div>
      </div>
    </div>
  </div>
</template>
