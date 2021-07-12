import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';
import {darkTheme, lightTheme} from '../theme';
import {SnackbarProvider} from 'notistack';

import PrivateRoute from '../_components/PrivateRoute';
import HomePage from '../HomePage/HomePage';
import LoginPage from '../LoginPage/LoginPage';
import {BrowserRouter, Route, Router, Switch} from 'react-router-dom';
import {userContext} from '../_context/user-context';
import {themeContext} from '../_context/theme-context';
import SignupPage from "../SignupPage/SignupPage";
import ResetPage from "../ResetPage/ResetPage";
import PreEnrolmentPage from "../PreEnrolmentPage/PreEnrolmentPage";
import NotFound from "../_components/not_found";

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("darkTheme") === "true");
    const appliedTheme = createMuiTheme(theme ? darkTheme : lightTheme);


    const [user, setUser] = useState({logged: false, ping: true});
    const [needs, _setNeeds] = useState([]);
    const setNeeds = (needs) => {
        if (!Array.isArray(needs)) return _setNeeds([]);
        return _setNeeds(needs);
    }

    return (
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
            <userContext.Provider value={{user: user, setUser: setUser, needs: needs, setNeeds: setNeeds}}>
                <themeContext.Provider value={{theme: theme, switchTheme: () => {
                    localStorage.setItem("darkTheme", (!theme).toString());
                    setTheme(!theme);
                }, label: theme? "dark": "light"}}>
                    <BrowserRouter basename="/app">
                        <Switch>
                        <PrivateRoute path={'/home'}  component={HomePage}/>
                        <Route path={'/login'} component={LoginPage}/>
                        <Route path={'/signup'} component={SignupPage}/>
                        <Route path={'/password-reset'} component={ResetPage}/>
                        <Route path={'/prematricula'} component={PreEnrolmentPage}/>
                        <Route component={NotFound}/>
                        </Switch>
                    </BrowserRouter>
                </themeContext.Provider>
            </userContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    );
}

export default App