import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: {
        index: './src/index.ts',
        worker: './src/worker.ts',
      },
      outDir: 'dist',
      minify: true,
      logLevel: 'error',
      exports: true,
      dts: true,
    },
  ],
)
