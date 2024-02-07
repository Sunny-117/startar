# unplugin-starter [![npm](https://img.shields.io/npm/v/unplugin-starter.svg)](https://npmjs.com/package/unplugin-starter)

Starter template for [unplugin](https://github.com/unjs/unplugin).

## Installation

```bash
npm i -D unplugin-starter
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import UnpluginStarter from 'unplugin-starter/vite'

export default defineConfig({
  plugins: [UnpluginStarter()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import UnpluginStarter from 'unplugin-starter/rollup'

export default {
  plugins: [UnpluginStarter()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-starter/esbuild')()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-starter/webpack')()],
}
```

<br></details>

## License

[MIT](./LICENSE) License © 2023-PRESENT [Sunny-117](https://github.com/Sunny-117)
