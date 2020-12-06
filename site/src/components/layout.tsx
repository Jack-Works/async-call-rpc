import React, { useEffect } from 'react'
import { setupTwoslashHovers } from 'shiki-twoslash/dist/dom'
import Header from './header'
import './twoslash.css'
import { Container, CssBaseline, makeStyles, MuiThemeProvider, styled } from '@material-ui/core'
import { theme } from '../theme'

const useStyles = makeStyles((theme) => ({}))

function Layout({ children }) {
    useEffect(setupTwoslashHovers)
    const classes = useStyles()

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <Container maxWidth="md">
                <main>{children}</main>
            </Container>
        </MuiThemeProvider>
    )
}

export default Layout
