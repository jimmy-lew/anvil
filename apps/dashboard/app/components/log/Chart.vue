<script setup lang="ts">
import type { StringValue } from 'ms'

import type { ChartConfig } from '@/components/ui/chart'
import { VisAxis, VisFreeBrush, VisStackedBar, VisXYContainer } from '@unovis/vue'
import { format, parse } from 'ms'
import { ChartTooltipContent, componentToString } from '@/components/ui/chart'

interface Data {
  date: Date
  success: number
  error: number
}

const props = withDefaults(defineProps<{
  range?: StringValue
  start?: number
}>(), {
  range: '1d',
  start: Date.now(),
})

const emit = defineEmits(['update:rangeChanged'])

const THREE_DAY = 3 * 24 * 60 * 60 * 1000

const { range } = props
const { log_display: logs } = useLogs()
const chartData = computed(() => agg_logs(logs.value))
const data = computed(() => chartData.value.data)
const yDomain = computed(() => [0, Math.round(chartData.value.max * 1.2)])
const start = ref(props.start)
const range_ms = ref(parse(range))

const total_data_points = 180
const bucket_size = computed(() => {
  const size = parse(format(normalize(range_ms.value / total_data_points, 1000)))
  return size > 1000 ? size : 1000
})

const now = computed(() => normalize(start.value + (10 * bucket_size.value), bucket_size.value))
const { width: window_width } = useWindowSize()
const chart_width = computed(() => {
  const width = window_width.value - (window_width.value > 768 ? 270 : 0) - 28
  return normalize(width, 10)
})
const bar_size = computed(() => Math.floor(chart_width.value / total_data_points) - 2)

function agg_logs(logs: RawLogItem[]) {
  const bucket_normalize = (ts: number) => normalize(ts, bucket_size.value)
  const normalized_logs = logs.map(log => ({ ...log, time: bucket_normalize(log.time) }))

  let max = 5

  const data = Array.from({ length: total_data_points + 1 }, (_, i) => {
    const timestamp = bucket_normalize(now.value - (i * bucket_size.value))
    const matching_logs = normalized_logs.filter(log => log.time === timestamp)
    const aggregate = matching_logs.reduce((agg, log) => {
      agg[log.level < 50 ? 'success' : 'error'] += 1
      return agg
    }, { date: new Date(timestamp), success: 0, error: 0 })

    const total = aggregate.success + aggregate.error
    if (total > max)
      max = total

    return aggregate
  })

  return { data, max }
}

watch(logs, () => {
  start.value = Date.now()
}, { immediate: true })

const config = {
  error: { label: 'error', color: '#f85149' },
  success: { label: 'success', color: '#333' },
} satisfies ChartConfig

function handleBrush(range: [number, number], _: any, user_driven: boolean) {
  if (!range || !user_driven)
    return
  const [end, new_start] = range
  range_ms.value = new_start - end
  start.value = new_start
  emit('update:rangeChanged', range_ms.value, format(range_ms.value))
}

function normalize(n: number, bucket_size: number): number {
  return Math.floor(n / bucket_size) * bucket_size
}

const ticks = computed(() => {
  const tick_bucket_size = parse(format(normalize(range_ms.value / 6, 1000)))
  const ticks = []
  for (let i = 0; i < 7; i++) {
    const timestamp = now.value - (i * tick_bucket_size)
    ticks.push(new Date(timestamp))
  }
  return ticks
})
</script>

<template>
  <ChartContainer :config="config" class="aspect-auto h-13.5 w-full" cursor>
    <VisXYContainer
      :data
      :y-domain="yDomain"
      :y-axis="{ showLabels: false }"
      color="#666"
    >
      <VisStackedBar
        :x="(d: Data) => d.date.getTime()"
        :y="[(d: Data) => d.error, (d: Data) => d.success]"
        :color="['#f85149', '#333']"
        :bar-width="bar_size"
        :rounded-corners="false"
      />
      <VisAxis
        type="x"
        :x="(d: Data) => d.date.getTime()"
        :grid-line="false"
        :tick-values="ticks"
        :tick-format="(d: number) => {
          const date = new Date(d)
          return range_ms > THREE_DAY
            ? date.toLocaleDateString('en-SG', { month: 'short', day: '2-digit' })
            : date.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        }"
      />
      <VisFreeBrush :on-brush-end="handleBrush" />
      <ChartTooltip />
      <ChartCrosshair
        :template="componentToString(config, ChartTooltipContent, {
          labelKey: 'success',
          indicator: 'line',
          labelFormatter(d) {
            const date = new Date(normalize(new Date(d).getTime(), bucket_size))
            return range_ms > THREE_DAY
              ? date.toLocaleDateString('en-SG', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
              : date.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
          },
        })"
        color="#0000"
      />
    </VisXYContainer>
  </ChartContainer>
</template>

<style>
</style>
