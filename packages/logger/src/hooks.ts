const STACK_DEPTH = 4
const STACK_INDENT = 7
const UNDEF_STACK_MSG = 'NO STACK FOUND'.padStart(STACK_INDENT)

export function traceHook(ctx: any) {
  const [stack, ..._] = new Error(' ').stack?.split('\n').slice(STACK_DEPTH) ?? [UNDEF_STACK_MSG]
  const stackLine = stack.substring(STACK_INDENT)
  const match = stackLine.match(/^(.*)\s\((.*)\)$/)
  ctx.func = match ? match[1] : ''
  ctx.file_loc = match ? match[2] : stackLine
  return ctx
}
