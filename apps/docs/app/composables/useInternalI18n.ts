import type { LocaleObject } from '@nuxtjs/i18n'

export function useInternalI18n() {
  const config = useRuntimeConfig().public

  const { locale, t } = useI18n()
  const locales = config.filteredLocales as LocaleObject<string>[]

  return {
    locale,
    locales,
    t,
    localePath: useLocalePath(),
    switchLocalePath: useSwitchLocalePath(),
  }
}
