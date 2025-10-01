import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [{
    input: 'src/index.ts',
    format: ['esm'],
    type: 'bundle',
    dts: true,
  }],
})
