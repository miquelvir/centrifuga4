import React, {useEffect} from 'react';
import {Formik, Field, Form, ErrorMessage, useFormik} from 'formik';
import {authenticationService} from '../_services/auth.service';
import {Redirect} from "react-router-dom";
import {userContext} from "../_context/user-context";
import report from "../_components/snackbar.report";
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
import {func} from "prop-types";
import {authenticationService as signupService} from "../_services/signup.service";
import {useSnackbar} from "notistack";
import {passwordResetService} from "../_services/password-reset.service";

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
        minWidth: "500px",
        height: "50%",
        padding: "50px",
        margin: "auto"
    }
}));

const ResetPage = (props) => {
    const classes = useStyles();
    const themeCtx = React.useContext(themeContext);

    const {enqueueSnackbar} = useSnackbar();

    const {t} = useTranslation();
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token')
    const username = query.get('username')
    const formik = useFormik({
        initialValues: {
            username: username,
            password: '',
            password2: ''
        },
        validationSchema: yup.object({
            username: yup.string().required('Username is required').email('Enter a valid email.'),
            password: yup.string().required('Password is required').matches(
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
              "Must be longer than 8 characters; including: 1 uppercase, 1 lowercase, 1 number and 1 of '@$!%*#?&'"
            ),
            password2: yup.string().oneOf([yup.ref('password'), null], "Passwords don't match").required("Password is required")
        }),
        enableReinitialize: true,
        onSubmit: ({username, password, password2}, {setStatus, setSubmitting}) => {
            setStatus();

            passwordResetService.signup(username, password, token)
                .then(
                    function (result) {
                        setSubmitting(false);
                        props.history.push("/login");
                    },
                    function (error) {
                        setSubmitting(false);
                        setStatus(error);

                        if (error.response.status === 401){
                            enqueueSnackbar(t("invalid_expired_reset"), { variant: "warning"});
                        } // TODO report, same in the signup
                    });
        }
    });

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

                                     <Box m={2}>
                                         <Typography>{t("choose your new password 🔑")}</Typography>
                                    </Box>

                                    <form onSubmit={formik.handleSubmit}>
                                        <TextField
                                            label={t("username")}
                                            helperText={formik.touched["username"] && formik.errors["username"]}
                                            type="email"
                                            name="username"
                                            className={classes.field}
                                            value={formik.values["username"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.status}
                                            disabled
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
                                        <TextField
                                            label={t("confirm_password")}
                                            name="password2"
                                            type="password"
                                            helperText={formik.touched["password2"] && formik.errors["password2"]}
                                            className={classes.field}
                                            value={formik.values["password2"]}
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
                                                {t("change password")}
                                            </Button>
                                        </Box>
                                    </form>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid xs={2} item/>
            </Grid></div>);

}

export default ResetPage;