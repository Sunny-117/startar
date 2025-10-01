import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [{
    input: 'src/index.ts',
    format: ['esm'],
    type: 'bundle',
    dts: true,
    alias: {
      // https://github.com/vitejs/vite/pull/14030
      // we can always use non-transpiled code since we support node 18+
      prompts: 'prompts/lib/index.js',
    },
    minify: true
  }],
})
