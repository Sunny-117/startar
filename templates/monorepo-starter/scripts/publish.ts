#!/usr/bin/env node
// scripts/publish.ts

import chalk from 'chalk'
import { execa } from 'execa'
import inquirer from 'inquirer'

const error = chalk.bgRed // error展示颜色
const warning = chalk.hex('#FFA500') // warning展示颜色
const success = chalk.green // success展示颜色

async function testPackage() {
  await execa('pnpm', ['run', 'changeset'], { stdio: 'inherit' })
  console.log(
    success(
      '你已选择测试包的版本 并在根目录.changeset生成markdown文档的变更信息'
    )
  )

  const changelog = await inquirer.prompt([
    {
      name: 'isUpdate',
      type: 'list',
      message: '是否要更新对应的changelog文件',
      choices: ['是', '否'],
    },
  ])

  const { isUpdate } = changelog
  if (isUpdate === '是') {
    await execa('pnpm', ['run', 'version'], { stdio: 'inherit' })
    console.log(success('已经更新changelog文件 请检查是否有误'))

    const release = await inquirer.prompt([
      {
        name: 'isPushOrRelease',
        type: 'list',
        message: '是否要执行发包？',
        choices: ['是'],
      },
    ])

    const { isPushOrRelease } = release
    if (isPushOrRelease === '是') {
      await execa('pnpm', ['run', 'release'], { stdio: 'inherit' })
      await execa('pnpm', ['run', 'exit'], { stdio: 'inherit' })
      console.log(success('已经退出测试发包流程'))
    }
  } else {
    console.log(error('已退出'))
    process.exit() // 主动退出
  }
}

async function runInquirerCommand() {
  const answer = await inquirer.prompt([
    {
      name: 'isRelease',
      type: 'list',
      message: '请选择要发正式包还是测试包',
      choices: ['正式包', '测试包', '测试通过发正式包'],
    },
  ])

  const { isRelease } = answer

  if (isRelease === '正式包') {
    await execa('pnpm', ['run', 'changeset'], { stdio: 'inherit' })
    console.log(
      success(
        '你已选择正式包的版本 并在根目录.changeset生成markdown文档的变更信息'
      )
    )

    const changelog = await inquirer.prompt([
      {
        name: 'isUpdate',
        type: 'list',
        message: '是否要更新对应的changelog文件',
        choices: ['是', '否'],
      },
    ])

    const { isUpdate } = changelog
    if (isUpdate === '是') {
      await execa('pnpm', ['run', 'version'], { stdio: 'inherit' })
      console.log(success('已经更新changelog文件 请检查是否有误'))

      const release = await inquirer.prompt([
        {
          name: 'isPushOrRelease',
          type: 'list',
          message: '是否要执行发包？',
          choices: ['是'],
        },
      ])

      const { isPushOrRelease } = release
      if (isPushOrRelease === '是') {
        await execa('pnpm', ['run', 'release'], { stdio: 'inherit' })
      }
    } else {
      console.log(error('已退出'))
      process.exit() // 主动退出
    }
  } else if (isRelease === '测试包') {
    try {
      await execa('pnpm', ['run', 'pre'], { stdio: 'inherit' })
      await testPackage()
    } catch {
      console.log(warning('你已进入测试包模式，请继续'))
      await testPackage()
    }
  } else if (isRelease === '测试通过发正式包') {
    await execa('pnpm', ['run', 'version'], { stdio: 'inherit' })
    console.log(success('已经更新changelog文件 请检查是否有误'))

    const release = await inquirer.prompt([
      {
        name: 'isPushOrRelease',
        type: 'list',
        message: '是否要执行发包？',
        choices: ['是'],
      },
    ])

    const { isPushOrRelease } = release
    if (isPushOrRelease === '是') {
      await execa('pnpm', ['run', 'release'], { stdio: 'inherit' })
    }
  }
}

runInquirerCommand()
