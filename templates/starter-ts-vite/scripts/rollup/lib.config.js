import generatePackageJson from 'rollup-plugin-generate-package-json'
import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils'

const { name, module } = getPackageJSON('lib')
const pkgPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'Lib',
      format: 'umd',
    },
    plugins: [
      ...getBaseRollupPlugins(),
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: 'index.js',
        }),
      }),
    ],
  },
]
