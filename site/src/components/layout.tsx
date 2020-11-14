/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useEffect } from 'react'
import { setupTwoslashHovers } from 'shiki-twoslash/dist/dom'
import Header from './header'
import './layout.css'
import './twoslash.css'
import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import { theme } from '../theme'

function Layout({ children }) {
    useEffect(setupTwoslashHovers)

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <div
                style={{
                    margin: `0 auto`,
                    maxWidth: 960,
                    padding: `0 1.0875rem 1.45rem`,
                }}>
                <main>{children}</main>
            </div>
        </MuiThemeProvider>
    )
}

export default Layout
