import { AsyncCallOptions } from '../Async-Call'
import { isBoolean } from './constants'
const undefinedToTrue = (x: undefined | boolean) => (x === void 0 ? true : x)
export const normalizeLogOptions = (log: NonNullable<AsyncCallOptions['log']>) => {
    if (log === 'all') return [true, true, true, true, true, true] as const
    if (!isBoolean(log)) {
        const { beCalled, localError, remoteError, type, requestReplay, sendLocalStack } = log
        return [
            undefinedToTrue(beCalled),
            undefinedToTrue(localError),
            undefinedToTrue(remoteError),
            type !== 'basic',
            requestReplay,
            sendLocalStack,
        ] as const
    }
    if (log) return [true, true, true, true] as const
    return [] as const
}

export const normalizeStrictOptions = (strict: NonNullable<AsyncCallOptions['strict']>) => {
    if (!isBoolean(strict)) {
        const { methodNotFound, unknownMessage } = strict
        return [methodNotFound, unknownMessage] as const
    }
    return [strict, strict] as const
}
