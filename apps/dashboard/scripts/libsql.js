import { cpSync, existsSync, lstatSync, mkdirSync, realpathSync, rmSync } from 'node:fs'
import { arch, platform } from 'node:os'

function getPlatformBinary() {
  const p = platform()
  const a = arch()

  if (p === 'linux' && a === 'x64')
    return 'linux-x64-musl'
  if (p === 'linux' && a === 'arm64')
    return 'linux-arm64-musl'
  if (p === 'darwin' && a === 'arm64')
    return 'darwin-arm64'
  if (p === 'darwin' && a === 'x64')
    return 'darwin-x64'

  return 'linux-x64-musl'
}

const binaryName = getPlatformBinary()
const parentDir = '.output/server/node_modules/@libsql'
const sourceDir = `node_modules/@libsql/${binaryName}`
const targetDir = `.output/server/node_modules/@libsql/${binaryName}`

if (binaryName && existsSync(sourceDir)) {
  mkdirSync(parentDir, { recursive: true })

  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true })
  }

  // Resolve the real path if it's a symlink
  const realSourceDir = lstatSync(sourceDir).isSymbolicLink()
    ? realpathSync(sourceDir)
    : sourceDir

  // Copy the actual binary files (not symlink)
  cpSync(realSourceDir, targetDir, {
    recursive: true,
    force: true,
    dereference: true,
  })
  console.log(`✓ Copied ${binaryName} binary`)
}
else {
  console.warn(`⚠ No binary found for ${binaryName || 'unknown platform'}`)
}
