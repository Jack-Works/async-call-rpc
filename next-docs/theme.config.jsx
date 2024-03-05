import { useRouter } from 'next/router'
export default {
    logo: <span>async-call-rpc</span>,
    project: {
        link: 'https://github.com/Jack-Works/async-call-rpc',
    },
    docsRepositoryBase: 'https://github.com/Jack-Works/async-call-rpc/tree/main/next-docs',
    useNextSeoProps() {
        const { asPath } = useRouter()
        if (asPath !== '/') {
            return {
                titleTemplate: '%s – async-call-rpc',
            }
        }
    },
    head: <></>,
    primaryHue: 299,
    primarySaturation: 58,
}
