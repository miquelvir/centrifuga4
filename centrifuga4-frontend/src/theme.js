import {createMuiTheme} from "@material-ui/core/styles";

export const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#e98300',
      light: '#ffb342',
      dark: '#b05500',
      contrastText: '#000000',
    },
    secondary: {
      main: '#934d98',
      light: '#c57bc9',
      dark: '#63206a',
      contrastText: '#ffffff',
    },
    neutral: {
      main: '#ffffff',
      contrastText: '#000000',
      emphasisText: {
        high: '#000000DF',
        medium: '#00000098',
        low: '#0000005E',
      },
    }
  }
})

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    secondary: {
      main: '#ffcc80',
      light: '#ffffb0',
      dark: '#ca9b52',
      contrastText: '#000000',
    },
    primary: {
      main: '#ce93d8',
      light: '#ffc4ff',
      dark: '#9c64a6',
      contrastText: '#000000',
    },
    neutral: {
      main: '#1f1f1f',
      contrastText: '#ffffff',
      emphasisText: {
        high: '#ffffffDF',
        medium: '#ffffff98',
        low: '#ffffff5E',
      },
    }
  }
})
