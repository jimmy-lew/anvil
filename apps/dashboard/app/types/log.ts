export interface RawLogItem {
  log_id: string
  level: number
  time: number
  caller: string
  msg: string
  [key: string]: unknown
}
