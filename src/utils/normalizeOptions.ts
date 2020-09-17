import { AsyncCallOptions, AsyncCallStrictJSONRPC } from '../Async-Call'
import { isBoolean } from './constants'
export const normalizeLogOptions = (log: NonNullable<AsyncCallOptions['log']>) => {
    if (!isBoolean(log)) {
        const { beCalled, localError, remoteError, type, requestReplay, sendLocalStack } = log
        return [beCalled, localError, remoteError, type !== 'basic', requestReplay, sendLocalStack] as const
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
