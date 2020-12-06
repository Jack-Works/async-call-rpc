import React from 'react'
import { Link } from 'gatsby'

import {
    AppBar,
    Button,
    Toolbar,
    Typography,
    Box,
    MuiThemeProvider,
    CssBaseline,
    Paper,
    useTheme,
    Link as MuiLink,
} from '@material-ui/core'
import { theme } from '../theme'
import Header from '../components/header'
import styled from '@emotion/styled'
export default function IndexPage() {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Page />
        </MuiThemeProvider>
    )
}
const HeadLine = styled(Paper)`
    padding-top: 3em;
    padding-bottom: 3em;
    text-align: center;
`

function Page() {
    const theme = useTheme()
    console.log(theme)
    return (
        <>
            <Header />
            <HeadLine>
                <Typography variant="h2">async-call-rpc</Typography>
                <Typography variant="h5">A lightweight JSON RPC server {'&'} client</Typography>
                <Box sx={{ marginTop: 4 }} />
                <Button variant="contained" size="large" color="secondary">
                    Get started
                </Button>
            </HeadLine>
        </>
    )
}
