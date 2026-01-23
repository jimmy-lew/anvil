<script setup lang="ts">
import { Download } from 'lucide-vue-next'

const attrs = useAttrs()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button :class="attrs.class" variant="outline" size="icon">
        <Download />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="rounded">
      <Button variant="ghost">
        Export to JSON
      </Button>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>

</style>
