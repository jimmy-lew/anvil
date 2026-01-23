<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 bg-muted p-6 min-h-svh md:p-10">
    <div class="max-w-sm w-full flex flex-col gap-6">
      <NuxtLink to="#" class="flex items-center self-center gap-2 font-medium">
        <img src="/icon.svg" class="h-6 w-6">
        Anvil
      </NuxtLink>
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader class="text-center">
            <CardTitle class="text-xl">
              Welcome back
            </CardTitle>
            <CardDescription>
              Login with your Discord or Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthSignIn />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
