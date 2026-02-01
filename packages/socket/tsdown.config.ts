import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './index.ts',
  outDir: 'dist',
  minify: true,
  logLevel: 'error',
  exports: true,
  dts: true,
})
