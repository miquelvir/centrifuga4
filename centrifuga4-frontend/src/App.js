import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import {lightTheme, darkTheme} from './theme';
import Home from './components/home';

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("darkTheme") === "true");
    const appliedTheme = createMuiTheme(theme ? darkTheme : lightTheme);
    const changeTheme = () => {
        localStorage.setItem("darkTheme", (!theme).toString());
        setTheme(!theme);
    }
    return (
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
             <Home changeTheme={changeTheme}/>
      </ThemeProvider>
    );
}

export default App
