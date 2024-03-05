// @ts-check
import nextra from 'nextra'
import { transformerTwoslash, rendererRich } from '@shikijs/twoslash'

const withNextra = nextra({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.jsx',
    mdxOptions: {
        rehypePrettyCodeOptions: {
            //transformers: [transformerTwoslash({})],
        },
    },
})

export default withNextra({
    reactStrictMode: true,
})
