import React from 'react'
import { graphql, Link as gLink } from 'gatsby'
import Layout from '../components/layout'
import rehypeReact from 'rehype-react'
import { Card, CardContent, Link, Paper, Typography } from '@material-ui/core'

// const heading =
// @ts-ignore
const renderAst = new rehypeReact({
    createElement: React.createElement,
    components: {
        a: function (props) {
            let href = props.href
                ? // @ts-ignore
                  props.children?.[0] === 'Home'
                    ? '/'
                    : String(props.href).replace(/\.md$/g, '')
                : void 0
            if (href?.startsWith('.') || href?.startsWith('/')) {
                if (href.startsWith('.')) href = '.' + href
                return <Link component={gLink} {...props} to={href} color="textPrimary" underline="always" />
            } else return <Link {...props} href={href} color="textPrimary" underline="always" />
        },
    },
}).Compiler

export default function BlogPost({ data }) {
    const post = data.markdownRemark
    console.log(post)
    return (
        <Layout>
            <Card>
                <CardContent>
                    <Typography component="main">{renderAst(post.htmlAst)}</Typography>
                </CardContent>
            </Card>
        </Layout>
    )
}
export const query = graphql`
    query($slug: String!) {
        markdownRemark(fields: { slug: { eq: $slug } }) {
            htmlAst
        }
    }
`
