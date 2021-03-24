import { ErrorResponse, Request, SuccessResponse } from './jsonrpc'

export type ID = string | number | null | undefined
type CompatRequest = [type: 0, method: string, params: readonly unknown[] | object, id?: ID, stack?: string]
// [normal: 0, id, method, ...params]
// [+stack: 1, id, method, stack, ...params]
// [notify: 2, method, ...params]
// [+stack: 3, stack, ...params]
type CompatSuccessResponse = [type: 1, id: ID, result?: unknown]
type CompatErrorResponse = [type: 2, id: ID, code: number, message: string, data?: unknown]
export const CompressRequest = (req: Request): CompatRequest => {
    const x: CompatRequest = [0, req.method, req.params]
    if (req.id !== undefined) x[3] = req.id
    if (req.remoteStack) x[4] = req.remoteStack
    return x
}
export const DecompressRequest = ([, methods, param, id, stack]: CompatRequest) => Request(id, methods, param, stack)
export const CompressSuccessResponse = ({ result, id }: SuccessResponse): CompatSuccessResponse => {
    const x: CompatSuccessResponse = [1, id]
    if (result !== undefined) x[2] = result
    return x
}
export const DecompressSuccessResponse = ([, ...r]: CompatSuccessResponse) => SuccessResponse(...r)
export const CompressErrorResponse = ({ error: { code, message, data }, id }: ErrorResponse): CompatErrorResponse => {
    const x: CompatErrorResponse = [2, id, code, message]
    if (data !== undefined) x[4] = data
    return x
}
export const DecompressErrorResponse = ([, ...y]: CompatErrorResponse): ErrorResponse => ErrorResponse(...y)
export const Decompress = (x: CompatRequest | CompatErrorResponse | CompatSuccessResponse) => {
    if (x[0] == 0) return DecompressRequest(x)
    if (x[0] == 1) return DecompressSuccessResponse(x)
    return DecompressErrorResponse(x)
}
