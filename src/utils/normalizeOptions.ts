import type { AsyncCallOptions } from '../Async-Call.ts'
import { isBoolean } from './constants.ts'
const undefinedToTrue = (x: undefined | boolean) => (x === void 0 ? true : x)
type NormalizedLogOptions = readonly [
    beCalled: boolean,
    localError: boolean,
    remoteError: boolean,
    isPretty?: boolean,
    requestReplay?: boolean,
    sendLocalStack?: boolean,
]

export const normalizeLogOptions = (log: NonNullable<AsyncCallOptions['log']>): NormalizedLogOptions | [] => {
    if (log === 'all') return [true, true, true, true, true, true]
    if (!isBoolean(log)) {
        const { beCalled, localError, remoteError, type, requestReplay, sendLocalStack } = log
        return [
            undefinedToTrue(beCalled),
            undefinedToTrue(localError),
            undefinedToTrue(remoteError),
            type !== 'basic',
            requestReplay,
            sendLocalStack,
        ]
    }
    if (log) return [true, true, true, true] as const
    return []
}

export const normalizeStrictOptions = (strict: NonNullable<AsyncCallOptions['strict']>) => {
    if (!isBoolean(strict)) {
        const { methodNotFound, unknownMessage } = strict
        return [methodNotFound, unknownMessage] as const
    }
    return [strict, strict] as const
}
