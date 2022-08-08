import { createLogger } from './logger.js'
import { join } from 'path'
import {
    AsyncVersionOf,
    AsyncGeneratorVersionOf,
    AsyncCall,
    AsyncCallOptions,
    AsyncGeneratorCall,
} from '../../src/index.js'
import { createChannelPair, TestCallbackBasedChannel, TestEventBasedChannel } from './channels.js'
import { reproduceIDGenerator } from './reproduce.js'
import { expect } from 'vitest'

export const defaultImpl = {
    add: (x: number, y: number) => x + y,
    echo: async <T>(x: T) => x,
    undefined: () => {},
    throws: async () => {
        throw new Error('impl error')
    },
    withThisRef() {
        return this.add(1, 2)
    },
    DOMException() {
        throw new DOMException('message', 'name')
    },
    throwEcho(val: unknown) {
        throw val
    },
    throwBadException(type: 'm' | 'c' | 'cn') {
        if (type === 'm') {
            throw {
                get message() {
                    throw 1
                },
            }
        } else if (type === 'c') {
            throw {
                message: 'normal',
                get constructor() {
                    throw 2
                },
            }
        } else if (type === 'cn') {
            function f() {
                // @ts-expect-error
                this.message = 'normal message'
            }
            Object.defineProperty(f, 'name', {
                get() {
                    throw 3
                },
            })
            throw new (f as any)()
        }
    },
    byPos(opt: { a: number; b: number }) {
        return opt.a + opt.b
    },
}
const defaultImplGenerator = {
    async *echo(arr: number[]) {
        yield* arr
    },
    async *magic(): AsyncGenerator<any, any, any> {
        let last: any = undefined
        while (true) {
            try {
                last = yield last
            } catch (e) {
                last = e
            }
        }
    },
    *endless() {
        while (true) {
            try {
                yield 1
            } catch {
                yield 2
            } finally {
                continue
            }
        }
    },
}
type Options<T> = {
    client?: Partial<AsyncCallOptions>
    server?: Partial<AsyncCallOptions>
    opts?: Partial<AsyncCallOptions>
    impl?: T | Promise<T>
}
export function withSnapshotDefault(
    snapshot: string,
    f: (
        call: <T extends object = DefaultImpl>(option?: Options<T>) => AsyncVersionOf<T>,
        generatorCall: <T extends object = DefaultImplG>(option?: Options<T>) => AsyncGeneratorVersionOf<T>,
        log: (...args: any) => void,
        rawChannel: Record<'server' | 'client', TestCallbackBasedChannel | TestEventBasedChannel>,
    ) => Promise<void>,
    timeout = 800,
    C: typeof TestCallbackBasedChannel | typeof TestEventBasedChannel = TestEventBasedChannel,
) {
    async function testImpl() {
        const { emit, log } = createLogger(['server', 'client', 'testRunner'] as const)
        const { client, server } = createChannelPair(log, C)
        const idGenerator = reproduceIDGenerator()

        const serverShared = { channel: server, logger: log.server.log, idGenerator }
        const clientShared = { channel: client, logger: log.client.log, idGenerator }
        function setup<T extends object = DefaultImpl>(opt: Options<T> = {}): AsyncVersionOf<T> {
            const { client, server, impl, opts } = opt
            AsyncCall(impl || defaultImpl, { ...serverShared, ...opts, ...server })
            return AsyncCall<T>(impl || defaultImpl, { ...clientShared, ...opts, ...client })
        }
        function setupGenerator<T extends object = DefaultImplG>(opt: Options<T> = {}): AsyncGeneratorVersionOf<T> {
            const { client, server, impl, opts } = opt
            AsyncGeneratorCall(impl || defaultImplGenerator, { ...serverShared, ...opts, ...server })
            return AsyncGeneratorCall<T>(impl || defaultImplGenerator, { ...clientShared, ...opts, ...client })
        }
        await race(f(setup, setupGenerator, log.testRunner.log.log, { client, server }), timeout)
        expect(emit()).toMatchFile(join(__dirname, '../__file_snapshots__/', snapshot + '.md'))
    }
    return testImpl
}
withSnapshotDefault.debugger = (...[name, snap, f]: Parameters<typeof withSnapshotDefault>) => {
    withSnapshotDefault('DBG ONLY ' + name, snap, f)
}
export type DefaultImpl = typeof defaultImpl
type DefaultImplG = typeof defaultImplGenerator

async function race<T>(x: Promise<T>, timeoutTime: number): Promise<T> {
    return Promise.race([x, timeout(timeoutTime)])
}
async function timeout(x: number): Promise<never> {
    await delay(x)
    throw new Error('Timeout')
}
export function delay(x: number) {
    return new Promise((r) => setTimeout(r, x))
}
