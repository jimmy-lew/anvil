<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

const { signIn } = useAuth()

const email = ref('demo@gmail.com')
const isLoading = ref(false)

async function loginGoogle() {
  await signIn.social({
    provider: 'google',
  })
}

async function loginDiscord() {
  await signIn.social({
    provider: 'discord',
  })
}
</script>

<template>
  <form class="grid gap-6">
    <div class="flex flex-col gap-4">
      <Button variant="outline" class="w-full gap-2" @click="loginDiscord">
        <Icon name="simple-icons:discord" class="w-6 h-6" />
        Login with Discord
      </Button>
      <Button variant="outline" class="w-full gap-2" @click="loginGoogle">
        <Icon name="simple-icons:google" class="w-6 h-6" />
        Login with Google
      </Button>
    </div>
    <Separator label="Or continue with" />
    <div class="grid gap-2">
      <!-- Still unsure if i want to use magic links or passkeys -->
      <Label for="email">
        Email
      </Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="name@example.com"
        :disabled="isLoading"
        auto-capitalize="none"
        auto-complete="email"
        auto-correct="off"
      />
    </div>
    <Button type="submit" class="w-full" :disabled="isLoading">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      Login
    </Button>
  </form>
  <div class="mt-4 text-center text-sm text-muted-foreground">
    Don't have an account?
    <NuxtLink to="/register" class="underline">
      Sign up
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
