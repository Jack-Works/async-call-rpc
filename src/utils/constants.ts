export const isString = (x: unknown): x is string => typeof x === 'string'
export const isBoolean = (x: unknown): x is boolean => typeof x === 'boolean'
export const isFunction = (x: unknown): x is Function => typeof x === 'function'
export const isObject = (params: any): params is object => typeof params === 'object' && params !== null
export const ERROR = 'Error'
export const undefined = void 0
export const { setPrototypeOf } = Object
export const Promise_resolve = <T>(x: T) => Promise.resolve(x)
export const { isArray } = Array as { isArray(arg: any): arg is readonly any[] }
export const { apply } = Reflect
