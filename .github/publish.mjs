import { readFile, writeFile } from 'node:fs/promises'

const jsr_path = new URL('../jsr.json', import.meta.url)
const jsr = await readFile(jsr_path, 'utf8')
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

await writeFile(jsr_path, jsr.replace('{{version}}', version), 'utf8')
