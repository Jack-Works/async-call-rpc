import * as rpc from '../out/base.mjs'
import { WorkerChannel } from '../utils/web/worker.js'

const impl = {
    hello: () => 'hello from worker',
}
const host = rpc.AsyncCall(impl, { channel: new WorkerChannel(), log: false })
host.hello().then(console.log)
