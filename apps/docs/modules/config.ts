import type { LocaleObject } from '@nuxtjs/i18n'
import type { Nuxt } from 'nuxt/schema'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import { getGitBranch, getGitEnv } from '../utils/git'
import { inferSiteURL } from '../utils/meta'

function _filterLocale(nuxt: Nuxt, resolve: (...path: string[]) => string) {
  return (locale: string | LocaleObject<string>) => {
    const localeCode = typeof locale === 'string' ? locale : locale.code

    const localeFilePath = resolve('../i18n/locales', `${localeCode}.json`)
    const hasLocaleFile = existsSync(localeFilePath)

    const contentPath = join(nuxt.options.rootDir, 'content', localeCode)
    const hasContentFolder = existsSync(contentPath)

    if (!hasLocaleFile) {
      console.warn(`Locale file not found: ${localeCode}.json - skipping locale "${localeCode}"`)
    }

    if (!hasContentFolder) {
      console.warn(`Content folder not found: content/${localeCode}/ - skipping locale "${localeCode}"`)
    }

    return hasLocaleFile && hasContentFolder
  }
}

export default defineNuxtModule({
  meta: {
    name: 'config',
  },
  async setup(_options, nuxt) {
    const url = inferSiteURL()
    const gitInfo = getGitEnv()
    const siteName = 'Anvil'

    nuxt.options.site = defu(nuxt.options.site, {
      url,
      name: siteName,
      debug: false,
    })

    nuxt.options.appConfig.header = defu(nuxt.options.appConfig.header, {
      title: siteName,
    })

    nuxt.options.appConfig.seo = defu(nuxt.options.appConfig.seo, {
      titleTemplate: `%s - ${siteName}`,
      title: siteName,
      description: '',
    })

    nuxt.options.appConfig.github = defu(nuxt.options.appConfig.github, {
      owner: gitInfo?.owner,
      name: gitInfo?.name,
      url: gitInfo?.url,
      branch: getGitBranch(),
    })

    if (!nuxt.options.i18n.locales) {
      console.warn('No locales configured, skipping')
      return
    }
    const { resolve } = createResolver(import.meta.url)
    const filterLocales = _filterLocale(nuxt, resolve)
    const filteredLocales = nuxt.options.i18n.locales.filter(filterLocales)

    // Expose filtered locales
    nuxt.options.runtimeConfig.public.filteredLocales = filteredLocales

    nuxt.hook('i18n:registerModule', (register) => {
      const langDir = resolve('../i18n/locales')

      const locales = filteredLocales?.map((locale) => {
        const localeCode = typeof locale === 'string' ? locale : locale.code
        const localeName = typeof locale === 'string' ? locale : locale.name || locale.code
        return {
          code: localeCode,
          name: localeName,
          file: `${localeCode}.json`,
        }
      })

      register({
        langDir,
        locales,
      })
    })
  },
})
