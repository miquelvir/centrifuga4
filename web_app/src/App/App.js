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
import TeacherDashboardPage from "../TeacherDashboardPage/TeacherDashboardPage";
import NotFound from "../_components/not_found";
import AttendancePage from '../AttendancePage/AttendancePage';

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("darkTheme") === "true");
    const appliedTheme = createMuiTheme(theme ? darkTheme : lightTheme);


    const [user, setUser] = useState({logged: false, ping: true});
    const [needs, _setNeeds] = useState([]);
    const setNeeds = (needs) => {
        if (!Array.isArray(needs)) return _setNeeds([]);
        return _setNeeds(needs);
    }
    const [teacher, setTeacher] = useState(null);
    const routerRef = React.createRef();


    return (
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
            <userContext.Provider value={{
                user: user, 
                setUser: setUser, 
                
                needs: needs, 
                setNeeds: setNeeds,
                
                teacher: teacher,
                setTeacher: setTeacher}}>
                <themeContext.Provider value={{theme: theme, switchTheme: () => {
                    localStorage.setItem("darkTheme", (!theme).toString());
                    setTheme(!theme);
                }, label: theme? "dark": "light"}}>
                    <BrowserRouter  ref={routerRef} basename="/app">
                        <Switch>
                        <PrivateRoute path={'/home'} baseRouter={routerRef} component={HomePage}/>
                        <Route path={'/login'} component={LoginPage}/>
                        <Route path={'/signup'} component={SignupPage}/>
                        <Route path={'/password-reset'} component={ResetPage}/>
                        <Route path={'/prematricula'} component={PreEnrolmentPage}/>
                        <PrivateRoute path={'/teacher-dashboard'} component={TeacherDashboardPage}/>
                        <PrivateRoute path={'/attendance'} component={AttendancePage}/>
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
