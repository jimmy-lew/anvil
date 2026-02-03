import { defineConfig } from 'tsdown'

export default defineConfig(
  [
    {
      entry: './src/index.ts',
      format: 'esm',
      platform: 'node',

      noExternal: [/.*/],

      outDir: 'dist',
      clean: true,
      minify: false,
      shims: true,
      exports: true,
      sourcemap: true,
      dts: true,

      outputOptions: {
        inlineDynamicImports: true,
      },
    },
    {
      entry: './src/worker.ts',
      format: 'esm',
      platform: 'node',

      noExternal: [/.*/],

      outDir: 'dist',
      clean: true,
      minify: true,
      shims: true,
      exports: true,
      sourcemap: true,
      dts: true,

      outputOptions: {
        inlineDynamicImports: true,
      },
    },
  ],
)
