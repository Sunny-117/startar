// CDN 配置文件
// 发布到 npm 后，可通过以下公共 CDN 访问

export interface CdnProvider {
  name: string
  urlTemplate: string
  description: string
}

export const cdnProviders: CdnProvider[] = [
  {
    name: 'jsDelivr',
    urlTemplate: 'https://cdn.jsdelivr.net/npm/{package}@{version}/{file}',
    description: '全球 CDN，支持 npm 和 GitHub',
  },
  {
    name: 'unpkg',
    urlTemplate: 'https://unpkg.com/{package}@{version}/{file}',
    description: 'npm 官方 CDN',
  },
  {
    name: 'jsDelivr (GitHub)',
    urlTemplate: 'https://cdn.jsdelivr.net/gh/{package}@{version}/{file}',
    description: '基于 GitHub 的 CDN',
  },
  {
    name: 'BootCDN',
    urlTemplate: 'https://cdn.bootcdn.net/ajax/libs/{package}/{version}/{file}',
    description: '国内 CDN（需要手动提交收录）',
  },
]

// 常用文件路径
export const commonFiles = [
  'dist/index.js',
  'dist/index.mjs',
  'dist/index.d.ts',
  'dist/index.css',
]
