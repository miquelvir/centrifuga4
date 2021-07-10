import {createMuiTheme} from "@material-ui/core/styles";

export const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#e98300',
      light: '#ffb342',
      dark: '#b05500',
      contrastText: '#000000',  // todo deprecate
      emphasisText: {
        high: '#000000DF',
        medium: '#00000098',
        low: '#0000005E',
      },
    },
    secondary: {
      main: '#934d98',
      light: '#c57bc9',
      dark: '#63206a',
      contrastText: '#000000',  // todo deprecate
      emphasisText: {
        high: '#000000DF',
        medium: '#00000098',
        low: '#0000005E',
      },

    },
    neutral: {
      main: '#ffffff',
      contrastText: '#000000',
      emphasisText: {
        high: '#000000DF',
        medium: '#00000098',
        low: '#0000005E',
      },
      status: {
        dirty: '#ffcf3d',
        success: '#c0e882'
      }
    }
  }
})

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#934d98',
      light: '#c57bc9',
      dark: '#63206a',
      contrastText: '#000000',  // todo deprecate
      emphasisText: {
        high: '#000000DF',
        medium: '#00000098',
        low: '#0000005E',
      },
    },
    secondary: {
      main: '#ffcc80',
      light: '#ffffb0',
      dark: '#ca9b52',
      contrastText: '#000000',  // todo deprecate
      emphasisText: {
        high: '#000000DF',
        medium: '#00000098',
        low: '#0000005E',
      },
    },
    neutral: {
      main: '#1f1f1f',
      contrastText: '#ffffff',  // todo deprecate
      emphasisText: {
        high: '#ffffffDF',
        medium: '#ffffff98',
        low: '#ffffff5E',
      },
      status: {
        dirty: '#ffcf3d',
        success: '#c0e882'
      }
    }
  }
})
