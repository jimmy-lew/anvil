import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: './src/start.ts',
      format: 'esm',
      platform: 'node',

      noExternal: [/.*/],

      outDir: 'dist',
      clean: true,
      minify: false,
      logLevel: 'error',
      sourcemap: true,
      shims: true,

      outputOptions: {
        inlineDynamicImports: true,
      },
    },
    {
      entry: 'node_modules/@anvil/logger/node_modules/thread-stream/lib/worker.js',
      format: 'esm',
      platform: 'node',

      noExternal: [/.*/],

      outDir: 'dist/ext',
      clean: true,
      minify: false,
      logLevel: 'error',
      sourcemap: true,
      shims: true,

      outputOptions: {
        inlineDynamicImports: true,
      },
    },
    {
      entry: '@anvil/logger/worker',
      format: 'esm',
      platform: 'node',

      noExternal: [/.*/],

      outDir: 'dist',
      clean: true,
      minify: false,
      logLevel: 'error',
      sourcemap: true,
      shims: true,

      outputOptions: {
        inlineDynamicImports: true,
      },
    },
  ],
)
