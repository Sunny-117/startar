import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  alias: {
    // https://github.com/vitejs/vite/pull/14030
    // we can always use non-transpiled code since we support node 18+
    prompts: 'prompts/lib/index.js',
  },
  rollup: {
    inlineDependencies: true,
    esbuild: {
      target: 'node18',
      minify: true,
    },
  },
})
