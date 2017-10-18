import findPackages from 'find-packages'
import semver = require('semver')
import majors = require('major-versions')
import commonTags = require('common-tags')
import chalk from 'chalk'
import path = require('path')
import symlinkDir from 'symlink-dir'

const oneLine = commonTags.oneLine
const highlight = chalk.yellow

type Manifest = {
  name: string,
  version: string,
  dependencies: {
    [name: string]: string,
  },
  devDependencies: {
    [name: string]: string,
  },
  optionalDependencies: {
    [name: string]: string,
  },
}

type Package = {
  manifest: Manifest,
  path: string,
}

export default async function (
  root: string,
  opts?: { ignore?: string[] }
) {
  const pkgs: Package[] = await findPackages(root, {
    ignore: opts && opts.ignore
  })

  const pkgMap = createPkgMap(pkgs)

  Promise.all(Object.keys(pkgMap).map(name => linkDeps(pkgMap[name])))

  function linkDeps(pkg: Package) {
    const dependencies = Object.assign({},
      pkg.manifest.devDependencies,
      pkg.manifest.optionalDependencies,
      pkg.manifest.dependencies)
    Promise.all(Object.keys(dependencies)
      .filter(depName => pkgs.some(pkg => pkg.manifest.name === depName))
      .map(depName => {
        const range = dependencies[depName]
        const major = getMajorFromRange(range)
        return `${depName}@${major}`
      })
      .map(pkgMajorId => pkgMap[pkgMajorId])
      .filter(Boolean)
      .filter(dependency => areCompatible(pkg.manifest.name, dependencies[dependency.manifest.name], dependency.manifest))
      .map(dependency => link(pkg, dependency))
    )
  }
}

function getMajorFromRange(range: string): string {
  const major = majors(range)[0]
  const index = major.indexOf('.')
  if (index === -1) return major
  return major.substr(0, index)
}

function createPkgMap(pkgs: Package[]): {
  [pkgId: string]: Package
} {
  const pkgMap = {}
  for (let pkg of pkgs) {
    pkgMap[createPkgMajorId(pkg.manifest.name, pkg.manifest.version)] = pkg
  }
  return pkgMap
}

function createPkgMajorId(name: string, version: string) {
  const major = semver.major(version)
  return `${name}@${major}`
}

function areCompatible(dependentName: string, dependentRange: string, dependency: Manifest) {
  if (semver.satisfies(dependency.version, dependentRange)) {
    return true
  }
  const available = `${dependency.name}@${dependency.version}`
  const needed = `${dependency.name}@${dependentRange}`
  console.warn(oneLine`
    Local ${highlight(available)}
    cannot be used by ${highlight(dependentName)} which needs
    ${highlight(needed)}
  `)
  return false
}

async function link(pkg: Package, dep: Package) {
  const target = path.join(pkg.path, 'node_modules', dep.manifest.name)
  await symlinkDir(dep.path, target)
}
