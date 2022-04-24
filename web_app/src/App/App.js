import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';
import {darkTheme, lightTheme} from '../theme';
import {SnackbarProvider} from 'notistack';
import {confirmContext} from '../_context/confirm-context';
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
import {useTranslation} from "react-i18next";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogContentText from "@material-ui/core/DialogContentText";

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

    const [confirmDialog, setConfirmDialog] = React.useState({
        open: false,
        title: null,
        subtitle: null,
        success: () => {},
        cancel: () => {},
        args: []
    });
    const confirm = (title, subtitle, successCallable, cancelCallable=null, args=[]) => {
        setConfirmDialog(
            {
              open: true,
              title: title,
              subtitle: subtitle,
              success: successCallable,
              cancel: cancelCallable === null? () => {}: cancelCallable,
                args: args
            }
        );
    }
    const handleCloseConfirm = () => {
        setConfirmDialog({...confirmDialog, open: false});
    }
    const { t } = useTranslation();


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
                    <confirmContext.Provider value={{confirm: confirm}}>
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
                        <Dialog
                            open={confirmDialog.open}
                            onClose={handleCloseConfirm}
                            aria-labelledby="responsive-dialog-title"
                        >
                            {confirmDialog.title &&
                            <DialogTitle id="responsive-dialog-title">
                                {t(confirmDialog.title)}
                            </DialogTitle>
                            }
                            {confirmDialog.subtitle && <DialogContent>
                                <DialogContentText>
                                    {t(confirmDialog.subtitle)}
                                </DialogContentText>
                            </DialogContent>}
                            <DialogActions>
                            <Button autoFocus onClick={() => {
                                confirmDialog.cancel(...confirmDialog.args);
                                handleCloseConfirm();
                            }} color="primary">
                                {t("cancel")}
                            </Button>
                            <Button onClick={() => {
                                confirmDialog.success(...confirmDialog.args);
                                handleCloseConfirm();
                            }} color="primary" autoFocus>
                                {t("continue")}
                            </Button>
                            </DialogActions>
                        </Dialog>
                    </confirmContext.Provider>
                </themeContext.Provider>
            </userContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    );
}

export default App
