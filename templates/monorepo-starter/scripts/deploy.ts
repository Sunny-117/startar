#!/usr/bin/env node
// scripts/deploy.ts

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { execa } from 'execa'
import inquirer from 'inquirer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const success = chalk.green
const error = chalk.bgRed
const warning = chalk.hex('#FFA500')
const info = chalk.blue

interface PackageJson {
  name: string
  version: string
  private?: boolean
}

interface CdnInfo {
  name: string
  url: string
}

// 获取 CDN 链接
function getCdnUrls(
  packageName: string,
  version: string,
  file: string = ''
): CdnInfo[] {
  const cleanName = packageName.startsWith('@')
    ? packageName.slice(1)
    : packageName
  const filePath = file ? `/${file}` : ''

  return [
    {
      name: 'jsDelivr',
      url: `https://cdn.jsdelivr.net/npm/${packageName}@${version}${filePath}`,
    },
    {
      name: 'unpkg',
      url: `https://unpkg.com/${packageName}@${version}${filePath}`,
    },
    {
      name: 'jsDelivr (GitHub)',
      url: `https://cdn.jsdelivr.net/gh/${cleanName}@${version}${filePath}`,
    },
  ]
}

// 显示 CDN 链接
function displayCdnLinks(packageInfo: PackageJson) {
  console.log(info('\n📦 包已发布，可通过以下 CDN 访问：\n'))

  const cdnUrls = getCdnUrls(packageInfo.name, packageInfo.version)

  cdnUrls.forEach((cdn) => {
    console.log(success(`${cdn.name}:`))
    console.log(`  ${cdn.url}`)
  })

  console.log(info('\n常用文件路径示例：'))
  const commonFiles = ['dist/index.js', 'dist/index.mjs', 'dist/index.d.ts']
  commonFiles.forEach((file) => {
    console.log(success(`\n${file}:`))
    getCdnUrls(packageInfo.name, packageInfo.version, file).forEach((cdn) => {
      console.log(`  ${cdn.name}: ${cdn.url}`)
    })
  })
}

// 检查是否已登录 npm
async function checkNpmLogin(): Promise<boolean> {
  try {
    await execa('npm', ['whoami'])
    return true
  } catch {
    return false
  }
}

// 主函数
async function deploy() {
  // 选择要部署的包
  const packagesDir = path.join(__dirname, '../packages')
  const packages = fs.readdirSync(packagesDir).filter((p) => {
    const pkgPath = path.join(packagesDir, p)
    if (!fs.statSync(pkgPath).isDirectory()) return false

    const packageJsonPath = path.join(pkgPath, 'package.json')
    if (!fs.existsSync(packageJsonPath)) return false

    const pkg: PackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8')
    )
    return !pkg.private
  })

  if (packages.length === 0) {
    console.log(error('没有可发布的包（所有包都是 private）'))
    return
  }

  const { selectedPackage } = await inquirer.prompt([
    {
      name: 'selectedPackage',
      type: 'list',
      message: '请选择要发布的子包',
      choices: packages,
    },
  ])

  const packageJsonPath = path.join(
    packagesDir,
    selectedPackage,
    'package.json'
  )
  const packageInfo: PackageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf8')
  )

  console.log(info(`\n准备发布: ${packageInfo.name}@${packageInfo.version}`))

  // 检查是否为 beta/alpha 版本
  if (/beta|alpha|rc/.test(packageInfo.version)) {
    console.log(warning(`检测到预发布版本: ${packageInfo.version}`))
  }

  // 检查 dist 目录
  const distPath = path.join(packagesDir, selectedPackage, 'dist')
  if (!fs.existsSync(distPath)) {
    console.log(error(`未找到 dist 目录，请先构建项目`))
    const { shouldBuild } = await inquirer.prompt([
      {
        name: 'shouldBuild',
        type: 'confirm',
        message: '是否现在构建？',
        default: true,
      },
    ])

    if (shouldBuild) {
      console.log(info('开始构建...'))
      await execa(
        'pnpm',
        ['-C', `./packages/${selectedPackage}`, 'run', 'build'],
        {
          stdio: 'inherit',
        }
      )
    } else {
      console.log(warning('已取消发布'))
      return
    }
  }

  // 检查是否登录 npm
  const isLoggedIn = await checkNpmLogin()
  if (!isLoggedIn) {
    console.log(warning('未登录 npm，请先登录'))
    const { shouldLogin } = await inquirer.prompt([
      {
        name: 'shouldLogin',
        type: 'confirm',
        message: '是否现在登录？',
        default: true,
      },
    ])

    if (shouldLogin) {
      await execa('npm', ['login'], { stdio: 'inherit' })
    } else {
      console.log(warning('已取消发布'))
      return
    }
  }

  // 选择发布方式
  const { publishType } = await inquirer.prompt([
    {
      name: 'publishType',
      type: 'list',
      message: '请选择发布方式',
      choices: [
        { name: '正式发布 (latest)', value: 'latest' },
        { name: 'Beta 发布 (beta)', value: 'beta' },
        { name: 'Alpha 发布 (alpha)', value: 'alpha' },
        { name: '自定义 tag', value: 'custom' },
      ],
    },
  ])

  let tag = publishType
  if (publishType === 'custom') {
    const { customTag } = await inquirer.prompt([
      {
        name: 'customTag',
        type: 'input',
        message: '请输入自定义 tag',
        default: 'next',
      },
    ])
    tag = customTag
  }

  // 确认发布
  const { confirmPublish } = await inquirer.prompt([
    {
      name: 'confirmPublish',
      type: 'confirm',
      message: `确认发布 ${packageInfo.name}@${packageInfo.version} (tag: ${tag})？`,
      default: true,
    },
  ])

  if (!confirmPublish) {
    console.log(warning('已取消发布'))
    return
  }

  // 执行发布
  console.log(info('\n开始发布到 npm...'))
  try {
    const publishArgs = ['publish', '--access', 'public']
    if (tag !== 'latest') {
      publishArgs.push('--tag', tag)
    }

    await execa(
      'pnpm',
      ['-C', `./packages/${selectedPackage}`, ...publishArgs],
      {
        stdio: 'inherit',
      }
    )

    console.log(success('\n✅ 发布成功！'))

    // 显示 CDN 链接
    displayCdnLinks(packageInfo)

    console.log(info('\n💡 提示：'))
    console.log('  - jsDelivr 和 unpkg 会自动同步 npm 包')
    console.log('  - 首次访问可能需要等待几分钟缓存')
    console.log('  - 可以使用 ?purge 参数强制刷新缓存')
  } catch (error_) {
    console.log(error('\n❌ 发布失败'))
    console.log(error_)
    process.exit(1)
  }
}

deploy()
