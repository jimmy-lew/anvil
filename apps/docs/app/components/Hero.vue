<script setup lang="ts">
const animationTriggered = ref(false)

onMounted(() => {
  setTimeout(() => {
    animationTriggered.value = true
  }, 500)
})
</script>

<template>
  <UPageHero>
    <template #title>
      <div class="relative inline-block">
        <Motion
          v-if="animationTriggered"
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
          :animate="animationTriggered ? {
            y: [0, 8, -4, 0],
          } : { y: 0 }"
          :transition="{
            duration: 0.8,
            delay: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.3, 0.6, 1],
          }"
        >
          <h1 class="font-header relative">
            Forge fanatically.
          </h1>
        </Motion>
      </div>
    </template>
    <template #description>
      <p class="my-5 leading-7 text-pretty">
        Create mods with extreme ease and flexibility.
      </p>
      <p class="my-5 leading-7 text-pretty">
        Anvil brings the best of the Hytale modding ecosystem into one app.
      </p>
    </template>
    <template #body>
      <HeroLinks />
      <AppInstallation />
    </template>
  </UPageHero>
</template>
