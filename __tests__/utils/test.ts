import { createLogger, type Logger } from './logger.js'
import { join } from 'path'
import {
    type AsyncVersionOf,
    type AsyncGeneratorVersionOf,
    AsyncCall,
    type AsyncCallOptions,
    AsyncGeneratorCall,
} from '../../src/index.js'
import { createChannelPairFromConstructor, TestEventBasedChannel } from './channels.js'
import { reproduceIDGenerator } from './reproduce.js'
import { expect } from 'vitest'

export const defaultImpl = {
    add: (x: number, y: number) => x + y,
    echo: async <T>(x: T) => x,
    undefined: () => {},
    deep_undefined: () => ({ a: { b: { c: undefined } } }),
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
    options?: Partial<AsyncCallOptions>
    impl?: T | Promise<T>
}
export function withSnapshotDefault(
    snapshotName: string,
    runner: (context: {
        init: <T extends object = DefaultImpl>(option?: Options<T>) => AsyncVersionOf<T>
        initIterator: <T extends object = DefaultImplIterator>(option?: Options<T>) => AsyncGeneratorVersionOf<T>
        log: (...args: any) => void
        channel: Record<'server' | 'client', AsyncCallOptions['channel']>
    }) => Promise<void>,
    {
        timeout = 800,
        createChannelPair = (log) => createChannelPairFromConstructor(log, TestEventBasedChannel),
    }: {
        timeout?: number
        createChannelPair?: (
            logger: Record<'server' | 'client', Logger>,
        ) => Record<'server' | 'client', AsyncCallOptions['channel']>
    } = {},
) {
    async function testImpl() {
        const { emit, log } = createLogger(['server', 'client', 'testRunner'])
        const { client, server } = createChannelPair(log)
        const idGenerator = reproduceIDGenerator()

        const serverShared = { channel: server, logger: log.server.log, idGenerator }
        const clientShared = { channel: client, logger: log.client.log, idGenerator }
        function init<T extends object = DefaultImpl>(initOptions: Options<T> = {}): AsyncVersionOf<T> {
            const { client, server, impl = defaultImpl, options } = initOptions
            AsyncCall(impl, Object.assign(serverShared, options, server))
            return AsyncCall<T>(impl, Object.assign(clientShared, options, client))
        }
        function initIterator<T extends object = DefaultImplIterator>(
            initOptions: Options<T> = {},
        ): AsyncGeneratorVersionOf<T> {
            const { client, server, impl = defaultImplGenerator, options } = initOptions
            AsyncGeneratorCall(impl, Object.assign(serverShared, options, server))
            return AsyncGeneratorCall<T>(impl, Object.assign(clientShared, options, client))
        }
        await race(
            runner({
                log: log.testRunner.log.log,
                channel: { client, server },
                init,
                initIterator: initIterator,
            }),
            timeout,
        )
        expect(emit()).toMatchFile(join(__dirname, '../__file_snapshots__/', snapshotName + '.md'))
    }
    return testImpl
}
withSnapshotDefault.debugger = (...[name, runner, options]: Parameters<typeof withSnapshotDefault>) => {
    return withSnapshotDefault('DBG ONLY ' + name, runner, options)
}
export type DefaultImpl = typeof defaultImpl
type DefaultImplIterator = typeof defaultImplGenerator

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
