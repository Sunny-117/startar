export const devCommand = 'dev' // 启动调试的script
export const buildWatchCommand = 'build:watch' // 启动实时构建的script
export const buildCommand = 'build' // 静态构建的script（防止没有产物的时候，引入不了产物，对于被依赖者没有dist文件则先进行构建）
export const dist = 'dist' // 静态构建的产物名称（防止没有产物的时候，引入不了产物，对于被依赖者判断有没有dist文件）
export const exceptBuildWatchCommand: string[] = [] // 禁止实时构建的包名，例如: ['@scope/foo']
