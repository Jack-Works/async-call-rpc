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
export default function IndexPage() {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Page />
        </MuiThemeProvider>
    )
}
function Page() {
    const theme = useTheme()
    console.log(theme)
    return (
        <>
            <Header />
            <Paper>
                <Typography variant="h3">🔨 Work in progress</Typography>
            </Paper>
        </>
    )
}
