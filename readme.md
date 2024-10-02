# Starter

基于 N 的模板，N=?, 提供 select 的能力

- Vite
- Esbuild
- SWC
- rollup
- Rspack(Rsbuild)
- rolldown

插件开发，推荐使用 unplugin-starter，同时兼容 vite,rollup,esbuild,webpack,rspack...

## dev

```bash
pnpm i
pnpm dev
node index.js demo1 demo2 -t
demo1 true -=====-
```

## 目录结构

```
├── build.config.ts
├── index.js
├── package.json
├── pnpm-lock.yaml
├── readme.md
├── src
│   ├── index.ts
│   └── utils.ts
├── templates
│   ├── monorepo-starter
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── packages
│   │   │   └── foo
│   │   │       ├── LICENSE
│   │   │       ├── README.md
│   │   │       ├── package.json
│   │   │       ├── src
│   │   │       │   └── index.ts
│   │   │       ├── tests
│   │   │       │   └── index.test.ts
│   │   │       ├── tsconfig.json
│   │   │       └── tsup.config.ts
│   │   ├── pnpm-lock.yaml
│   │   ├── pnpm-workspace.yaml
│   │   └── tsconfig.json
│   ├── starter-ts-tsup
│   │   ├── LICENSE
│   │   ├── README.md
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── pnpm-lock.yaml
│   │   ├── src
│   │   │   └── index.ts
│   │   ├── tests
│   │   │   └── index.test.ts
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   ├── starter-ts-unbuild
│   │   ├── CONTRIBUTING.md
│   │   ├── LICENSE.md
│   │   ├── README.md
│   │   ├── build.config.ts
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── pnpm-lock.yaml
│   │   ├── pnpm-workspace.yaml
│   │   ├── src
│   │   │   └── index.ts
│   │   ├── test
│   │   │   └── index.test.ts
│   │   └── tsconfig.json
│   └── starter-ts-vite
│       ├── README-Zh.md
│       ├── README.md
│       ├── babel.config.js
│       ├── package.json
│       ├── packages
│       │   ├── lib
│       │   │   ├── index.ts
│       │   │   ├── package.json
│       │   │   └── src
│       │   │       └── __tests__
│       │   │           └── index.spec.ts
│       │   └── shared
│       │       ├── index.ts
│       │       └── package.json
│       ├── playground
│       │   └── demo
│       │       └── index.ts
│       ├── pnpm-lock.yaml
│       ├── pnpm-workspace.yaml
│       ├── scripts
│       │   └── rollup
│       │       ├── dev.config.js
│       │       ├── lib.config.js
│       │       └── utils.js
│       └── tsconfig.json
└── tsconfig.json
```
