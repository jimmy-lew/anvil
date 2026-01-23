<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const isLoading = ref(false)
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="name">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            type="text"
            auto-capitalize="none"
            auto-complete="name"
            auto-correct="off"
            :disabled="isLoading"
          />
        </div>
        <Button :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Sign In
        </Button>
      </div>
    </form>
    <Separator label="Or continue with" />
    <div class="flex items-center gap-4 flex-col">
      <Button variant="outline" class="w-full gap-2">
        <Icon name="simple-icons:discord" class="w-6 h-6" />
        Discord
      </Button>
      <Button variant="outline" class="w-full gap-2">
        <Icon name="simple-icons:google" class="w-6 h-6" />
        Google
      </Button>
    </div>
  </div>
</template>
