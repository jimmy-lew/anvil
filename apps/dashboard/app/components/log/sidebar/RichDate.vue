<script setup lang="ts">
const { date } = defineProps<{
  date: Date
}>()

const user_tz = Intl.DateTimeFormat().resolvedOptions().timeZone
const offset = -date.getTimezoneOffset() / 60
const sign = offset >= 0 ? '+' : '-'

const relative = computed(() => {
  let time_diff = Math.round((Date.now() - date.getTime()) / 1_000)
  if (time_diff < 60)
    return `${time_diff}s ago`
  time_diff = Math.round(time_diff / 60)
  if (time_diff < 60)
    return `${time_diff} mins ago`
  time_diff = Math.round(time_diff / 60)
  if (time_diff < 24)
    return `${time_diff} hours ago`
  time_diff = Math.round(time_diff / 24)
  return `${time_diff} days ago`
})
</script>

<template>
  <Tooltip>
    <TooltipTrigger>
      <div class="w-fit inline-block">
        <div class="text-right text-base leading-tight">
          <span class="text-muted-foreground">
            <span class="uppercase ">
              {{ date.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) }}
              {{ date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2, hour12: false }) }}
              GMT{{ sign }}{{ offset }}
            </span>
          </span>
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent variant="outline" side="left" class="p-2">
      <Table>
        <TableBody>
          <TableRow class="border-b-0">
            <TableCell class="text-muted-foreground p-1">
              {{ user_tz }}
            </TableCell>
            <TableCell class="p-1 pl-3">
              {{ date.toLocaleDateString(undefined, { timeZone: 'Asia/Singapore', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }) }}
            </TableCell>
          </TableRow>
          <TableRow class="border-b-0">
            <TableCell class="text-muted-foreground p-1">
              UTC
            </TableCell>
            <TableCell class="p-1 pl-3">
              {{ date.toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }) }}
            </TableCell>
          </TableRow>
          <TableRow class="border-b-0">
            <TableCell class="text-muted-foreground p-1">
              Relative
            </TableCell>
            <TableCell class="p-1 pl-3">
              {{ relative }}
            </TableCell>
          </TableRow>
          <TableRow class="border-b-0">
            <TableCell class="text-muted-foreground p-1">
              Timestamp
            </TableCell>
            <TableCell class="p-1 pl-3">
              {{ date.getTime() }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TooltipContent>
  </Tooltip>
</template>

<style scoped>

</style>
