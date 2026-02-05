<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside
            :ui="{
              root: 'lg:max-h-screen lg:top-0',
            }"
          >
            <DocsAsideLeftTop />
            <DocsAsideLeftBody />
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>
