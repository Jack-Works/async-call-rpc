import { exec } from 'child_process'
import { stdout } from 'process'
import { watch } from 'fs'
import { join } from 'path'

const rebuild = throttle(function rebuild() {
    console.log('Rebuilding document')
    const child = exec('npm run doc:api && npm run doc:md')
    child.stdout.pipe(stdout)
}, 2000)

const watchingPath = join('./es/')
watch(watchingPath, (event, filename) => {
    if (filename !== 'tsdoc-metadata.json') {
        console.log(`[${new Date().toLocaleTimeString()}] ${filename} updated`)
        rebuild()
    }
})

const tsc = exec('npm run build -- --watch')
tsc.stdout.pipe(stdout)

const rollup = exec('npm run roll -- --watch')
rollup.stdout.pipe(stdout)

const docsify = exec('npm run doc:preview')
docsify.stdout.pipe(stdout)

function throttle(fn, wait) {
    let timer,
        firstTime = true
    return function () {
        if (firstTime) {
            fn.apply(this, arguments)
            firstTime = false
        }
        if (timer) {
            return false
        }
        timer = setTimeout(() => {
            clearTimeout(timer)
            timer = null
            fn.apply(this, arguments)
        }, wait)
    }
}
