import format from 'pretty-format'
import type { Console } from '../../src/index.js'
import { toMatchFile } from 'jest-file-snapshot'
import { expect } from 'vitest'

expect.extend({ toMatchFile })

export type TimelineItem =
    | { type: 'message'; sender?: string; receivers: string[]; message: unknown }
    | { type: 'log'; message: unknown[]; kind: string; from: string }
export type Logger = {
    send(msg: unknown): void
    receive(msg: unknown): void
    log: Console
}
export function createLogger<T extends string>(roles: readonly T[]) {
    const timeline: TimelineItem[] = []
    function emit() {
        let str = ['# Timeline\n']
        let count = 0
        for (const line of timeline) {
            if (line.type === 'log') {
                str.push(`## T=${count++} Log: ${line.from}/${line.type}\n` + formatValue(line.message))
            } else {
                let head = ''
                if (line.sender && line.receivers.length) head = `${line.sender} => ${line.receivers.join(', ')}`
                else if (!line.sender && line.receivers.length) head = `${line.receivers.join(', ')} received`
                else if (line.sender && !line.receivers.length) head = `${line.sender} sent`
                else head = '???????????????????????'
                str.push(`## T=${count++} Message: ${head}\n` + formatValue(line.message))
            }
        }
        return str.join('\n')
    }
    const log: Record<T, Logger> = {} as any
    for (const role of roles) {
        log[role] = {
            send(message) {
                timeline.push({ message, receivers: [], sender: role, type: 'message' })
            },
            receive(message) {
                const last = timeline[timeline.length - 1]
                if (last?.type === 'message' && JSON.stringify(message) === JSON.stringify(last.message))
                    last.receivers.push(role)
                else timeline.push({ message, receivers: [role], type: 'message' })
            },
            log: new Proxy({} as Console, {
                get(_, kind: string) {
                    return (...message: any[]) => timeline.push({ message, type: 'log', kind, from: role })
                },
            }),
        }
    }
    return { emit, log }
}

function code(lang: string, str: string) {
    return '\n```' + lang + '\n' + str + '\n```\n'
}
function formatValue(value: unknown) {
    return code('php', (format as any)(value, { indent: 4 }))
}
