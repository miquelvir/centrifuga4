import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import {lightTheme, darkTheme} from '../theme';
import { SnackbarProvider } from 'notistack';

import { history } from '../_helpers/history';
import { authenticationService } from '../_services/auth.service';
import PrivateRoute from '../_components/PrivateRoute';
import HomePage from '../HomePage/HomePage';
import LoginPage from '../LoginPage/LoginPage';
import { Router, Route, Link } from 'react-router-dom';
import {Home} from "@material-ui/icons";
import {userContext} from '../_context/user-context';

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("darkTheme") === "true");
    const appliedTheme = createMuiTheme(theme ? darkTheme : lightTheme);
    const changeTheme = () => {
        localStorage.setItem("darkTheme", (!theme).toString());
        setTheme(!theme);
    }

    const [user, setUser] = useState({});


    return (
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
            <userContext.Provider value={{user: user, setUser: setUser}}>
                <Router history={history}>
                    <PrivateRoute exact path="/" component={HomePage} changeTheme={changeTheme}/>
                    <Route path="/login" component={LoginPage} />
                </Router>
            </userContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    );
}

export default App
