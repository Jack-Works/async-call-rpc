import { createMuiTheme } from '@material-ui/core'
import { teal, indigo } from '@material-ui/core/colors'
export const theme = createMuiTheme({
    palette: {
        mode: 'dark',
        primary: indigo,
        secondary: teal,
    },
    components: {
        MuiButton: {
            styleOverrides: { root: { textTransform: 'none' } },
        },
    },
})
