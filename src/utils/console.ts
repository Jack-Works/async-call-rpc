//#region Console
/**
 * The minimal Console interface that AsyncCall needs.
 * @public
 */
export interface Console {
    debug?(...args: unknown[]): void
    log(...args: unknown[]): void
    groupCollapsed?(...args: unknown[]): void
    groupEnd?(...args: unknown[]): void
    error?(...args: unknown[]): void
}
