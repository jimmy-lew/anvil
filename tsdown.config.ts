import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: ['./src/start.ts'],
      // unbundle: true,
      outDir: 'dist',
      logLevel: 'error',
    },
    {
      entry: ['./src/cli.ts'],
      outDir: 'dist',
      logLevel: 'error',
    },
  ],
)
