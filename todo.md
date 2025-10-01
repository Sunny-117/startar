## 运行原理，拉取代码模板的原理

`startar` 的入口位于 `src/index.ts`：
1. 使用 `minimist` 解析命令行参数，并结合 `prompts` 提供交互式问答。
2. 对目标目录名称进行合法性校验，必要时清空或创建目录。
3. 根据用户选择确定模板目录（内置名称或自定义路径），通过 `getTemplateDir` 定位具体文件夹。
4. 遍历模板文件，调用 `copy`、`replacePlaceholders`、`customizePackageJson` 等工具函数，将占位符替换为用户填写的配置信息。
5. 按需执行 Git 初始化与依赖安装，所有流程完成后输出提示信息。

## pnpm create xxx、npm init 的原理

- `npm init <name>` 会解析 `<name>`，尝试安装 `create-<name>` 包并运行其 `bin` 脚本，例如 `npm init vite` 实际下载并执行 `create-vite`。
- `pnpm create <name>` 是 `pnpm dlx create-<name>` 的糖语法，会临时下载对应包到缓存并执行，不污染全局依赖。
- 这类命令遵循 npm 的 `init`/`create` 约定，借助临时安装的 CLI 模块完成脚手架逻辑。

## 调研 create-vue、create-rspack、create-vite 快速脚手架

- **create-vue**：由官方维护，支持 Vue 3 + Vite + TS/SWC/JS、路由、Pinia、Vitest、Cypress 等可选特性，交互式程度高，可直接输出项目结构。
- **create-rspack**：Rspack 团队提供的脚手架，可选择 React/Vue/Solid 等前端栈，强调 Rspack 构建性能，提供 TypeScript / SWC 支持及示例配置。
- **create-vite**：Vite 官方脚手架，适配多框架（Vue、React、Svelte、Solid 等），生成最小化模板，可通过 `--template` 参数直接指定框架与语言组合。
- 三者均提供交互式问题与命令行参数模式，核心流程与 `startar` 类似，区别在于内置模板类型与周边工具链配置。

## CLI 模板拉取原理

`startar` 的模板位于仓库 `templates` 目录，也支持传入绝对路径或相对路径：

1. 若传入内置名称，`getTemplateDir` 会拼接 `templates/<name>`；若传入路径，则按路径解析。
2. `validateTemplate` 会检查目录是否存在，避免用户输入错误。
3. 复制时区分文件与文件夹：文件调用 `fs.readFileSync` 获取内容后进行占位符替换，文件夹使用递归 `copy`。
4. `renameFiles` 字典允许将 `_gitignore` 等特殊文件名在拷贝阶段重命名为规范名称。
5. 模板中的 `package.json` 会通过 `customizePackageJson` 注入名称、描述、作者、license、包管理器等字段，生成最终项目配置。
