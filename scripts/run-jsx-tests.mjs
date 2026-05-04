import { existsSync, readFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const requestedFiles = process.argv.slice(2)

if (requestedFiles.length === 0) {
  console.error('No test file specified. Usage: npm test -- test/path/file.jsx')
  process.exit(1)
}

let failures = 0

for (const requestedFile of requestedFiles) {
  const absolutePath = resolve(process.cwd(), requestedFile)
  const displayPath = relative(process.cwd(), absolutePath)

  if (!existsSync(absolutePath)) {
    console.error(`FAIL ${displayPath}`)
    console.error('  Test file does not exist.')
    failures += 1
    continue
  }

  try {
    const source = readFileSync(absolutePath, 'utf8')
    const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(
      `${source}\n//# sourceURL=${pathToFileURL(absolutePath).href}`,
    )}`
    const module = await import(moduleUrl)

    if (typeof module.verifySpecification !== 'function') {
      throw new Error('Expected exported function verifySpecification().')
    }

    const result = await module.verifySpecification()
    if (result !== true) {
      throw new Error('verifySpecification() did not return true.')
    }

    const id = module.testCase?.id ?? 'UNKNOWN'
    console.log(`PASS ${displayPath} (${id})`)
  } catch (error) {
    console.error(`FAIL ${displayPath}`)
    console.error(`  ${error.message}`)
    failures += 1
  }
}

if (failures > 0) {
  process.exit(1)
}
