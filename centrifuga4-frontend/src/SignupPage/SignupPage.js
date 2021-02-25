import React from 'react';
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
import {useOnMount} from "../_helpers/on-mount";
import {safe_password_repetition, safe_email_required, safe_password, safe_username_required} from "../_yup/validators";
import TranslateButton from "../_components/translate_button.component";
import ThemeButton from "../_components/theme_button.component";
import {PUBLIC_URL} from "../config";

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

    useOnMount(() => {
        i18next.changeLanguage(query.get('lan')).then();
    })

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
            username: safe_username_required(t),
            email: safe_email_required(t),
            password: safe_password(t),
            password2: safe_password_repetition(t),
            name: yup.string().required(t("name_required")),
            surname1: yup.string().required(t("surname1_required")),
            surname2: yup.string().required(t("surname2_required"))
        }),
        enableReinitialize: true,
        onSubmit: ({username, email, password, name, surname1, surname2, password2}, {setStatus, setSubmitting}) => {
            setStatus();

            signupService.signup(username, password, email, name, surname1, surname2, token)
                .then(...errorHandler({handle401: false, handle400: false}))
                .then(
                    function (result) {
                        enqueueSnackbar(t("sign_up_success"), {variant: "success"});
                        setSubmitting(false);
                        props.history.push("/login");
                    },
                    function (error) {
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
                                    <img src={`${PUBLIC_URL}/logo_centrifuga4_${themeCtx.label}.svg`} alt="Logo Centrífuga" style={{height: "85px"}}/>

                                     <Box m={2}>
                                         <Typography>{t("been_invited")}</Typography>
                                    </Box>

                                    <form onSubmit={formik.handleSubmit}>
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
                <Grid xs={2} item>
                    <TranslateButton style={{float: 'right'}}/>
                    <ThemeButton style={{float: 'right'}}/>
                </Grid>
            </Grid></div>);

}

export default SignupPage;