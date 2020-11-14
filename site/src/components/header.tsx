import { AppBar, Toolbar, Typography, Box, Button, Link as MuiLink } from '@material-ui/core'
import { Link } from 'gatsby'
import React from 'react'

export default function Header() {
    return (
        <AppBar position="sticky" style={{ background: 'rgb(26, 28, 34)' }}>
            <Toolbar>
                <Typography variant="h6">
                    <MuiLink component={Link} to="/" color="textPrimary">
                        Async Call RPC
                    </MuiLink>
                </Typography>
                <Box flex={1} />
                <Button color="inherit" component={Link} to="/example">
                    Example
                </Button>
                <Box marginRight={2} />
                <Button color="inherit" href="https://github.com/Jack-Works/async-call-rpc#async-call">
                    Tutorial
                </Button>
                <Box marginRight={2} />
                <Button color="inherit" component={Link} to="/reference/async-call-rpc">
                    Reference
                </Button>
            </Toolbar>
        </AppBar>
    )
}
