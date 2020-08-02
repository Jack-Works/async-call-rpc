import * as rpc from '../out/base.mjs'
import { WorkerChannel } from '../utils/web/webworker.js'

const channel = new WorkerChannel(
    new Worker(new URL('./browser.webworker-worker.js', import.meta.url).pathname, { type: 'module' }),
)
const impl = {
    hello: () => 'hello from main',
}
const worker = rpc.AsyncCall(impl, { channel, log: false })
worker.hello().then(console.log)
