<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <SidebarProvider :default-open="open">
    <!-- <LayoutAppSidebar /> -->
    <SidebarInset class="h-screen overflow-hidden">
      <LayoutHeader />
      <div class="flex flex-col flex-1 min-h-0">
        <div class="@container/main grow min-h-0">
          <slot />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>

</style>
