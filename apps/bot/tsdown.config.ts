import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: {
        start: './src/start.ts',
      },
      outDir: 'dist',
      minify: false,
      logLevel: 'error',
    },
  ],
)
