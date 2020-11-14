{
    // https://github.com/microsoft/TypeScript-Website/issues/1341
    const twoslash = require('gatsby-remark-shiki-twoslash')
    const old = twoslash.default
    twoslash.default = (...args) => old(...args, { useNodeModules: true })
}
module.exports = {
    siteMetadata: {
        title: `async-call-rpc`,
        description: `Documentation site for async-call-rpc.`,
        author: `Jack Works`,
    },
    plugins: [
        `gatsby-plugin-react-helmet`,
        'gatsby-plugin-typescript',
        {
            resolve: 'gatsby-source-filesystem',
            options: { name: 'MDXPages', path: 'src/pages/' },
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: { name: 'API', path: `${__dirname}/../docs/` },
        },
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                defaultLayouts: {
                    default: require.resolve('./src/components/layout.tsx'),
                },
                gatsbyRemarkPlugins: [
                    {
                        resolve: 'gatsby-remark-shiki-twoslash',
                        options: {
                            theme: 'zeit',
                        },
                    },
                ],
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    // https://github.com/piotrdubiel/gatsby-remark-prettier/issues/1
                    {
                        resolve: `gatsby-remark-prettier`,
                        options: {
                            usePrettierrc: true,
                            prettierOptions: {},
                        },
                    },
                    {
                        resolve: `gatsby-remark-shiki`,
                        options: {
                            theme: 'zeit',
                        },
                    },
                ],
            },
        },
    ],
}
