import { AsyncCallOptions, AsyncCallLogLevel, AsyncCallStrictJSONRPC } from '../Async-Call'
export function normalizeLogOptions(log: AsyncCallOptions['log']): AsyncCallLogLevel {
    if (typeof log !== 'boolean') return log
    return {
        beCalled: log,
        localError: log,
        remoteError: log,
        type: log ? 'pretty' : 'basic',
    }
}
export function normalizeStrictOptions(strict: AsyncCallOptions['strict']): AsyncCallStrictJSONRPC {
    if (typeof strict !== 'boolean') return strict
    return {
        methodNotFound: strict,
        unknownMessage: strict,
        noUndefined: strict,
    }
}
