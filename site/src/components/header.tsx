import { AppBar, Toolbar, Typography, Box, Button, Link as MuiLink } from '@material-ui/core'
import { Link } from 'gatsby'
import React from 'react'
import styled from '@emotion/styled'

const ButtonGroup = styled('div')`
    & > * {
        margin-right: 1.5em;
    }
`

export default function Header() {
    return (
        <AppBar position="sticky" style={{ background: 'rgb(26, 28, 34)' }}>
            <Toolbar>
                <Typography variant="h6">
                    <MuiLink component={Link} to="/" color="textPrimary">
                        async-call-rpc
                    </MuiLink>
                </Typography>
                <Box sx={{ flex: 1 }} />
                <ButtonGroup>
                    <Button color="inherit" component={Link} to="/example">
                        Example
                    </Button>
                    <Button color="inherit" href="https://github.com/Jack-Works/async-call-rpc#async-call">
                        Tutorial
                    </Button>
                    <Button color="inherit" component={Link} to="/reference/async-call-rpc">
                        Reference
                    </Button>
                </ButtonGroup>
            </Toolbar>
        </AppBar>
    )
}
