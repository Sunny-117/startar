#!/usr/bin/env node
// scripts/dev.ts

import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { execa } from 'execa'
import inquirer from 'inquirer'
import {
  buildCommand,
  buildWatchCommand,
  devCommand,
  dist,
  exceptBuildWatchCommand,
} from './config.js'
import type { PackageInfo, PackageJson } from './types.js'

const error = chalk.bgRed // error展示颜色
const warning = chalk.hex('#FFA500') // warning展示颜色
const success = chalk.green // success展示颜色

// packages下面的文件夹
const pkgs = fs.readdirSync('packages').filter((p) => {
  return fs.statSync(`packages/${p}`).isDirectory()
})

const scriptDir = path.resolve(__dirname)
const monorepoDir = path.join(scriptDir, '..') // monorepo目录
const packageDir = path.join(monorepoDir, '/packages/') // packages目录

const allPackageName: Record<string, PackageInfo> = {} // 所有的包路径、包名

for (const pkgPathName of pkgs) {
  const { name, dependencies, scripts } = readPackageJson(pkgPathName)
  allPackageName[name] = {
    name,
    pkgPathName,
    dependencies: dependencies ?? {},
    scripts: scripts ?? {},
  }
}

/**
 * 读取指定路径下的package.json文件，并返回该文件中的name和dependencies字段
 */
function readPackageJson(pathName = ''): PackageJson {
  const packageJsonDir = path.join(`${packageDir + pathName}/package.json`)
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonDir, 'utf8')
  ) as PackageJson
  const { name, dependencies, scripts } = packageJson
  return {
    name: name ?? '',
    dependencies,
    scripts,
  }
}

/**
 * 递归获取子应用的依赖关系
 * 获取依赖包列表
 */
function getDependentPackages(
  packageName: string,
  packageJsonPath: string,
  allPackages: PackageInfo[]
): PackageInfo[] {
  const { dependencies = {} } = readPackageJson(packageJsonPath)
  const keys = Object.keys(dependencies)

  if (keys.length === 0) {
    return []
  }

  for (const dep of keys) {
    // 对依赖做去重操作以及添加
    if (allPackageName[dep] && !allPackages.includes(allPackageName[dep])) {
      const exceptCommand = exceptBuildWatchCommand.find(
        (command) => command === allPackageName[dep].name
      )
      if (exceptCommand) {
        continue
      }
      allPackages.push(allPackageName[dep])
      getDependentPackages(dep, allPackageName[dep].pkgPathName, allPackages)
    }
  }

  return allPackages
}

/**
 * 判断是否存在指定产物
 */
function isDist(app: string): boolean {
  const pathDir = path.join(packageDir + app)
  const readDist = fs.readdirSync(pathDir).find((p) => {
    return p === dist
  })
  return !!readDist
}

/**
 * 查找是否有相关命令例如dev、build等
 */
function checkScript(
  scriptName: string,
  packageScripts: Record<string, string>
): boolean {
  const packageScriptArray = Object.keys(packageScripts)
  if (packageScriptArray.length === 0) {
    process.exit() // 主动退出
  }
  return packageScriptArray.includes(scriptName)
}

// 运行选择命令
async function runInquirerCommand() {
  // 命令行询问选择包
  const answer = await inquirer.prompt([
    {
      name: 'choosePackage',
      type: 'list',
      message: '请选择要启动的子应用',
      choices: pkgs,
    },
  ])

  const { choosePackage } = answer // 选择的子应用
  const { name } = readPackageJson(choosePackage) // 获取包名
  console.log(`选择的子应用:${choosePackage}  包名: ${name}`)

  const dependentPackages = getDependentPackages(name, choosePackage, []) || []

  // 应用未依赖任何workspace里面的包
  if (dependentPackages.length === 0) {
    console.log(
      warning(
        `检测到应用未依赖workspace任何包 直接启动该应用${devCommand}指令 请检查${choosePackage}/package.json是否配置相关指令`
      )
    )
    const isDevScript = checkScript(devCommand, allPackageName[name].scripts)
    if (isDevScript) {
      await execa(
        'pnpm',
        ['-C', `./packages/${choosePackage}`, 'run', devCommand],
        {
          stdio: 'inherit',
        }
      )
    }
    console.log(error(`未找到${devCommand}指令 自动退出`))
    process.exit() // 主动退出
  }

  const dependentPackagesName = dependentPackages.map((dep) => dep.name)
  console.log(
    warning(
      `检测到 ${name} 依赖workspace的${dependentPackages.length}个其他应用\n分别为 ${dependentPackagesName}`
    )
  )
  console.log(
    success(
      `我们将会在${name}包下执行${devCommand}命令 其他包运行${buildWatchCommand}进行动态构建 请知晓`
    )
  )
  console.log(
    success(
      `准备根据依赖拓扑启动应用,确保每个应用都配置好相关${devCommand}、${buildWatchCommand}指令 请稍等...`
    )
  )

  // 应用依赖workspace里面的包 需要去执行动态构建
  const reverseDependent = [
    allPackageName[name],
    ...dependentPackages,
  ].reverse()

  for (const d of reverseDependent) {
    // 所选择的包执行dev命令
    if (d.name === name) {
      const isDevScript = checkScript(devCommand, allPackageName[name].scripts)
      if (isDevScript) {
        d.run = `pnpm -C ./packages/${d.pkgPathName} run ${devCommand}`
        continue
      }
      console.log(
        error(`未找到${d.pkgPathName}/package.json ${devCommand}指令 自动退出`)
      )
      process.exit() // 主动退出
    } else {
      // 其他的包执行buildWatch命令
      const isBuildWatchScript = checkScript(
        buildWatchCommand,
        allPackageName[d.name].scripts
      )
      if (isBuildWatchScript) {
        // 查找是否有相应的dist产物
        const isExistDist = isDist(d.pkgPathName)
        // 没有dist产物 先运行静态构建
        if (!isExistDist) {
          const isBuildScript = checkScript(
            buildCommand,
            allPackageName[d.name].scripts
          )
          if (isBuildScript) {
            await execa(
              'pnpm',
              ['-C', `./packages/${d.pkgPathName}`, 'run', buildCommand],
              {
                stdio: 'inherit',
              }
            )
          } else {
            console.log(
              error(`未找到${d.pkgPathName}/package.json ${buildCommand}指令`)
            )
          }
        }
        d.run = `pnpm -C ./packages/${d.pkgPathName} run ${buildWatchCommand}`
        continue
      }
      console.log(
        error(
          `未找到${d.pkgPathName}/package.json ${buildWatchCommand}指令 自动退出`
        )
      )
      process.exit() // 主动退出
    }
  }

  const commands = reverseDependent.map((command) => {
    const [cmd, ...args] = command.run!.split(' ')
    return execa(cmd, args, { stdio: 'inherit' })
  })

  await Promise.all(commands)
}

runInquirerCommand()
