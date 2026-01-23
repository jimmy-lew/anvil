import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: {
        start: './src/start.ts',
        worker: './src/logger/worker.ts',
      },
      outDir: 'dist',
      minify: false,
      logLevel: 'error',
    },
  ],
)
