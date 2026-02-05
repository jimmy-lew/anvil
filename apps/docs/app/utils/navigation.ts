import type { ContentNavigationItem } from '@nuxt/content'

export function flattenNavigation(items?: ContentNavigationItem[]): ContentNavigationItem[] {
  return items?.flatMap(
    item => item.children
      ? flattenNavigation(item.children)
      : [item],
  ) || []
}
