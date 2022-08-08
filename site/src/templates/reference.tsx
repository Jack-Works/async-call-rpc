import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import rehypeReact from 'rehype-react'
import {
    CardContent,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import { SmartLink } from './SmartLink'

// const heading =
// @ts-expect-error
const renderAst = new rehypeReact({
    createElement: React.createElement,
    components: {
        a: SmartLink,
        h2: (props: any) => <Typography variant="h5" component="h2" style={{ marginTop: 24 }} {...props} />,
        table: Table as any,
        thead: TableHead as any,
        tbody: TableBody as any,
        td: TableCell as any,
        tr: TableRow as any,
    },
}).Compiler

const useStyles = makeStyles((theme) => ({
    root: {
        paddingRight: theme.spacing(4),
        paddingLeft: theme.spacing(4),
    },
}))

export default function BlogPost({ data }) {
    const post = data.markdownRemark
    const classes = useStyles()
    return (
        <Layout>
            <Paper>
                <CardContent className={classes.root}>
                    <Typography component="main">{renderAst(post.htmlAst)}</Typography>
                </CardContent>
            </Paper>
        </Layout>
    )
}
export const query = graphql`
    query ($slug: String!) {
        markdownRemark(fields: { slug: { eq: $slug } }) {
            htmlAst
        }
    }
`
