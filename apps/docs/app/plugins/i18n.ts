import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtPlugin(async () => {
  addRouteMiddleware((to: RouteLocationNormalized) => {
    if (to.path === '/') {
      const cookieLocale = useCookie('i18n_redirected').value || 'en'

      return navigateTo(`/${cookieLocale}`)
    }
  })
})
