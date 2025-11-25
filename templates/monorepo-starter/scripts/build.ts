#!/usr/bin/env node
// scripts/build.ts

import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import { execa } from 'execa'
import { buildCommand } from './config.js'
import type { PackageJson } from './types.js'

const warning = chalk.hex('#FFA500') // warning展示颜色
const success = chalk.green // success展示颜色

// packages下面的文件夹
const pkgs = fs.readdirSync('packages').filter((p) => {
  return fs.statSync(`packages/${p}`).isDirectory()
})

const scriptDir = path.resolve(__dirname)
const monorepoDir = path.join(scriptDir, '..')
const packageDir = path.join(monorepoDir, '/packages/')

interface PackageInfo {
  name: string
  pkgPathName: string
  scripts: Record<string, string>
}

function readPackageJson(pathName = ''): PackageJson {
  const packageJsonDir = path.join(`${packageDir + pathName}/package.json`)
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonDir, 'utf8')
  ) as PackageJson
  const { name, scripts, dependencies } = packageJson
  return {
    name: name ?? '',
    dependencies,
    scripts,
  }
}

const allPackage: PackageInfo[] = []

for (const pkgPathName of pkgs) {
  const { name, scripts } = readPackageJson(pkgPathName)
  allPackage.push({
    name: name ?? '',
    pkgPathName,
    scripts: scripts ?? {},
  })
}

// 运行构建命令
async function runBuildCommand() {
  const commands: Promise<any>[] = []

  for (const pack of allPackage) {
    const { pkgPathName, scripts, name } = pack
    if (buildCommand in scripts) {
      console.log(warning(`正在构建: ${name}`))
      const runScript = execa(
        'pnpm',
        ['-C', `./packages/${pkgPathName}`, 'run', buildCommand],
        {
          stdio: 'inherit',
        }
      )
      commands.push(runScript)
    }
  }

  if (commands.length > 0) {
    await Promise.all(commands)
    console.log(success('所有子包构建完成'))
  } else {
    console.log(warning('没有任何子包需要构建'))
  }
}

runBuildCommand()
