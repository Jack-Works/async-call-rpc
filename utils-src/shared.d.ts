export interface AsyncCallMessageChannel {
    on(event: string, eventListener: (data: unknown, source?: unknown) => void): void
    emit(event: string, data: unknown, source?: unknown): void
}
