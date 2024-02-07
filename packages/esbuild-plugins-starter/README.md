# esbuild-plugin-xxx

ESBuild plugin for assets xxx

- [Author](https://github.com/Sunny-117)
- [GitHub Repo](https://github.com/Sunny-117/esbuild-plugins-starter)

## Usage

```bash
npm install esbuild-plugin-xxx --save-dev
pnpm install esbuild-plugin-xxx --save-dev
yarn add esbuild-plugin-xxx --save-dev
```

```typescript
import { build } from 'esbuild';
import { xxx } from 'esbuild-plugin-xxx';

(async () => {
  const res = await build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    outfile: './dist/main.js',
    plugins: [
      xxx({
      }),
    ],
  });
})();
```

## Configurations
