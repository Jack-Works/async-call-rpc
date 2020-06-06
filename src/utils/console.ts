//#region Console
/**
 * The minimal Console interface that AsyncCall needs.
 * @public
 */
export interface Console {
    debug(...args: unknown[]): void
    log(...args: unknown[]): void
    groupCollapsed(...args: unknown[]): void
    groupEnd(...args: unknown[]): void
    error(...args: unknown[]): void
}
export function getConsole(_console?: Console): Console {
    const console: Console = _console || (globalThis as any).console
    const defaultLog = (...args: unknown[]) => console.log(...args)

    const defaultConsole = {
        debug: defaultLog,
        error: defaultLog,
        groupCollapsed: defaultLog,
        groupEnd: defaultLog,
        log: defaultLog,
    }
    return Object.assign({}, defaultConsole, console)
}
