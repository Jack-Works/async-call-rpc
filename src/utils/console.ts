//#region Console
/**
 * The minimal Console interface that AsyncCall needs.
 * @public
 * @remarks
 * The method not provided will use "log" as it's fallback.
 */
export interface Console {
    warn?(...args: unknown[]): void
    debug?(...args: unknown[]): void
    log(...args: unknown[]): void
    groupCollapsed?(...args: unknown[]): void
    groupEnd?(...args: unknown[]): void
    error?(...args: unknown[]): void
}
