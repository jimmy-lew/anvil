import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: ['./src/start.ts'],
      outDir: 'dist',
      minify: true,
      logLevel: 'error',
    },
  ],
)
