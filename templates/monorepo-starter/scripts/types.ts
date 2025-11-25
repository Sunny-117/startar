export interface PackageJson {
  name: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

export interface PackageInfo {
  name: string
  pkgPathName: string
  dependencies: Record<string, string>
  scripts: Record<string, string>
  run?: string
}
