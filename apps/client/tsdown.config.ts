import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: 'esm',
  platform: 'node',

  noExternal: [/.*/],

  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: false,
  shims: true,
  treeshake: true,
})
