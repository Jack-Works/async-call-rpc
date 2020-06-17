import { removeStackHeader } from './error'

declare const document: any
export async function preservePauseOnException(stackCallback: (x: string) => void, f: Function, args: any[]) {
    const iframe = document.createElement('iframe')

    const promise = new Promise((resolve, reject) => {
        async function executor() {
            stackCallback(removeStackHeader(new Error().stack))
            // receive the return value
            resolve(await f(...args))
        }
        try {
            iframe.style.display = 'none'
            document.body.appendChild(iframe)
            {
                const document = iframe.contentDocument
                const window = iframe.contentWindow
                const button = document.createElement('button')
                document.body.appendChild(button)
                button.onclick = () =>
                    new window.Promise((r: any) => {
                        executor().then(r)
                    })
                window.addEventListener('unhandledrejection', (e: any) => reject(e.reason))
                button.click()
            }
        } catch (e) {
            try {
                // @ts-expect-error
                console.error('Please close preservePauseOnException.', e)
            } catch {}
            return resolve(f(...args))
        }
    })
    promise.finally(() => iframe.remove())
    return promise
}
