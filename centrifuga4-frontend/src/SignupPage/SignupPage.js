import React, {useEffect} from 'react';
import {useFormik} from 'formik';
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
import {authenticationService as signupService} from "../_services/signup.service";
import {useSnackbar} from "notistack";
import i18next from "i18next";
import {useErrorHandler} from "../_helpers/handle-response";

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

const SignupPage = (props) => {
    const classes = useStyles();
    const themeCtx = React.useContext(themeContext);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        i18next.changeLanguage(query.get('lan')).then();
    }, [])

    const {t} = useTranslation();
    const errorHandler = useErrorHandler();
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token')
    const email = query.get('email')
    const formik = useFormik({
        initialValues: {
            username: email,
            email: email,
            password: '',
            name: '',
            surname1: '',
            surname2: '',
            password2: ''
        },
        validationSchema: yup.object({  // todo translate
            username: yup.string().required('Username is required').email('Enter a valid email.'),
            email: yup.string().required('Email is required').email('Enter a valid email.'),
            password: yup.string().required('Password is required'),  // TODO
            password2: yup.string().oneOf([yup.ref('password'), null], "Passwords don't match").required("Password is required"),
            name: yup.string().required('Name is required'),
            surname1: yup.string().required('First surname is required'),
            surname2: yup.string().required('Second surname is required')
        }),
        enableReinitialize: true,
        onSubmit: ({username, email, password, name, surname1, surname2, password2}, {setStatus, setSubmitting}) => {
            setStatus();

            signupService.signup(username, password, email, name, surname1, surname2, token)
                .then(...errorHandler(false, true, false))  // TODO everywhere and how to
                .then(
                    function (result) {
                        enqueueSnackbar(t("sign_up_success"), {variant: "success"});
                        setSubmitting(false);
                        props.history.push("/login");
                    },
                    function (error) {
                        console.log(">>><<<", error.response, error.request);
                        setSubmitting(false);
                        setStatus(error);

                        if (error.response.status === 401){
                            enqueueSnackbar(t("invalid_expired_invite"), { variant: "warning"});
                        } else if (error.response.status === 400) {
                            enqueueSnackbar(t("used_invite"), { variant: "warning"});
                        }
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
                                         <Typography>{t("been_invited")}</Typography>
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
                                            label={t("email")}
                                            helperText={formik.touched["email"] && formik.errors["email"]}
                                            type="email"
                                            name="email"
                                            className={classes.field}
                                            value={formik.values["email"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.status}
                                            disabled
                                        />



                                        <TextField
                                            label={t("name")}
                                            helperText={formik.touched["name"] && formik.errors["name"]}
                                            name="name"
                                            className={classes.field}
                                            value={formik.values["name"]}
                                            onChange={formik.handleChange}
                                            disabled={formik.isSubmitting}
                                            onBlur={formik.handleBlur}
                                            error={formik.status}
                                        />
                                        <TextField
                                            label={t("surname1")}
                                            helperText={formik.touched["surname1"] && formik.errors["surname1"]}
                                            name="surname1"
                                            disabled={formik.isSubmitting}
                                            className={classes.field}
                                            value={formik.values["surname1"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.status}
                                        />
                                        <TextField
                                            label={t("surname2")}
                                            helperText={formik.touched["surname2"] && formik.errors["surname2"]}
                                            name="surname2"
                                            disabled={formik.isSubmitting}
                                            className={classes.field}
                                            value={formik.values["surname2"]}
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
                                                {t("sign_up")}
                                            </Button>
                                        </Box>
                                    </form>
                                </Paper></Box>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid xs={2} item/>
            </Grid></div>);

}

export default SignupPage;