const i = 'AsyncCall/'
// ! side effect
export const AsyncCallIgnoreResponse = Symbol.for(i + 'ignored')
export const AsyncCallNotify = Symbol.for(i + 'notify')
export const AsyncCallBatch = Symbol.for(i + 'batch')
