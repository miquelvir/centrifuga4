import React from 'react';
import {useFormik} from 'formik';
import {authenticationService} from '../_services/auth.service';
import {userContext} from "../_context/user-context";
import * as yup from 'yup';
import {TextField} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {themeContext} from "../_context/theme-context";
import Link from "@material-ui/core/Link";
import {passwordResetService} from "../_services/password-reset.service";
import {useSnackbar} from "notistack";
import {useErrorHandler} from "../_helpers/handle-response";
import {useOnMount} from "../_helpers/on-mount";
import {safe_username} from "../_yup/validators";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexGrow: 1,
        height: "100vh"
    },
    field: {
        width: "100%",
        margin: "5px"
    },
    paper: {
        width: "50%",
        height: "50%",
        minWidth: "500px",
        padding: "50px",
        margin: "auto"
    },
    reset: {
        width: "100%",
        textAlign: "end",
        cursor: ""
    }
}));


const LoginPage = (props) => {
    const classes = useStyles();
    const userCtx = React.useContext(userContext);
    const themeCtx = React.useContext(themeContext);

    const errorHandler = useErrorHandler();

    const {enqueueSnackbar} = useSnackbar();

    const logged = () => {
        const setLogged = userCtx["setUser"];
        setLogged({logged: true});
        const {from} = props.location.state || {from: {pathname: "/"}};
        props.history.push(from);
    }

    const {t} = useTranslation();
    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: yup.object({
            username: safe_username(t),
            password: yup.string().required(t("password_required"))
        }),
        enableReinitialize: true,
        onSubmit: ({username, password}, {setStatus, setSubmitting}) => {
            setStatus();
            authenticationService
                .login(username, password)
                .then(...errorHandler({}))
                .then(function (success) {
                        if (success) {
                            logged();
                        } else {
                            setStatus(true);
                        }
                    })
                .finally(() => {
                        setSubmitting(false);
                });
        }
    });

    useOnMount(() => {
        if (userCtx["user"]["logged"]) {
            props.history.push('/');
            return null;
        }

        authenticationService
            .ping()
            .then(...errorHandler({errorOut: false}))
            .then((success) => { if (success) logged(); });  // ignore failed ping (it is just not logged in)
    });

    const resetPassword = () => {
        const username = formik.values["username"];
        if (username === null || username === '' || username === undefined) {
            enqueueSnackbar(t("username_required_password_reset"), { variant: "warning"});
        } else {
            passwordResetService
                .startReset(username)
                .then(...errorHandler({errorOut: false}))
                .then(r => {
                enqueueSnackbar(t("started_password_reset"), { variant: "success"});
            })
        }
    }

    return (
        <div className={classes.root}>
            <Grid container>
                <Grid xs={2} item/>

                <Grid xs={8} item>
                    <Grid
                        container
                        spacing={0}
                        align="center"
                        justify="center"
                        direction="column"
                        style={{height: "100%"}}
                    >
                        <Grid item>
                            <Box m={2}>
                                <Paper className={classes.paper}>
                                    <img src={themeCtx.theme? "logo_centrifuga4_dark.svg": "logo_centrifuga4_light.svg"} alt="Logo Centrífuga" style={{height: "85px"}}/>

                                    <form onSubmit={formik.handleSubmit}>
                                        <TextField
                                            label={t("email")}
                                            disabled={formik.isSubmitting}
                                            helperText={formik.touched["username"] && formik.errors["username"]}
                                            type="email"
                                            name="username"
                                            className={classes.field}
                                            value={formik.values["username"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.status}
                                        />
                                        <TextField
                                            label={t("password")}
                                            name="password"
                                            type="password"
                                            helperText={formik.touched["password"] && formik.errors["password"]}
                                            className={classes.field}
                                            value={formik.values["password"]}
                                            disabled={formik.isSubmitting}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.status}
                                        />
                                        <Box my={3}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                disabled={formik.isSubmitting}
                                                className={classes.field}>
                                                {t("log_in")}
                                            </Button>
                                        </Box>
                                    </form>

                                    <Box className={classes.reset}>
                                        <Typography variant="caption">
                                            <Link
                                              component="button"
                                              variant="body2"
                                              onClick={resetPassword}
                                            >
                                              {t("reset_password")}
                                            </Link>
                                        </Typography>
                                        </Box>
                                </Paper></Box>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid xs={2} item/>
            </Grid></div>);

}

export default LoginPage;