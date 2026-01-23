export function useLogLabel() {
  const labels: Record<number, [string, string]> = {
    10: ['trace', 'text-stone-600'],
    20: ['debug', 'text-emerald-500'],
    30: ['info', 'text-sky-500'],
    40: ['warn', 'text-amber-600'],
    50: ['error', 'text-red-600'],
    60: ['fatal', 'text-violet-600'],
  }
  const default_level = ['unknown', 'text-stone-600']

  const get_label = (level: number | undefined) => {
    if (!level)
      return { label: 'unknown', color: 'text-stone-600' }
    const [label, color] = labels[level] || default_level
    return { label, color }
  }

  return {
    get_label,
  }
}
