import findPackages from 'find-packages'
import semver = require('semver')
import majors = require('major-versions')
import commonTags = require('common-tags')
import chalk = require('chalk')
import path = require('path')
import symlinkDir from 'symlink-dir'

const oneLine = commonTags.oneLine
const highlight = chalk.yellow

type Manifest = {
  name: string,
  version: string,
  dependencies: {
    [name: string]: string,
  }
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
    Promise.all(Object.keys(pkg.manifest.dependencies || {})
      .filter(depName => pkgs.some(pkg => pkg.manifest.name === depName))
      .map(depName => {
        const range = pkg.manifest.dependencies[depName]
        const major = majors(range)[0]
        return `${depName}@${major}`
      })
      .map(pkgMajorId => pkgMap[pkgMajorId])
      .filter(Boolean)
      .filter(dependency => areCompatible(pkg.manifest, dependency.manifest))
      .map(dependency => link(pkg, dependency))
    )
  }
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

function areCompatible(dependent: Manifest, dependency: Manifest) {
  if (semver.satisfies(dependency.version, dependent.dependencies[dependency.name])) {
    return true
  }
  const available = `${dependency.name}@${dependency.version}`
  const needed = `${dependency.name}@${dependent.dependencies[dependency.name]}`
  console.warn(oneLine`
    Local ${highlight(available)}
    cannot be used by ${highlight(dependent.name)} which needs
    ${highlight(needed)}
  `)
  return false
}

async function link(pkg: Package, dep: Package) {
  const target = path.join(pkg.path, 'node_modules', dep.manifest.name)
  await symlinkDir(dep.path, target)
}
