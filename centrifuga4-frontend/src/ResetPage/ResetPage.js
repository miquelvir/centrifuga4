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
import {useSnackbar} from "notistack";
import {passwordResetService} from "../_services/password-reset.service";
import i18next from "i18next";
import {useErrorHandler} from "../_helpers/handle-response";
import {useOnMount} from "../_helpers/on-mount";
import {safe_password, safe_password_repetition, safe_username} from "../_yup/validators";
import {RECAPTCHA} from "../config";
import ReCAPTCHA from "react-google-recaptcha";

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
    recaptcha: {
        margin: theme.spacing(3)
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

    const [recaptcha, setRecaptcha] = React.useState(null);
    function onChange(value) {
      setRecaptcha(value);
    }

    const {enqueueSnackbar} = useSnackbar();

    useOnMount(() => {
        i18next.changeLanguage(query.get('lan')).then();
    })

    const {t} = useTranslation();
    const query = new URLSearchParams(window.location.search);
    const errorHandler = useErrorHandler();
    const token = query.get('token')
    const email = query.get('email')
    const formik = useFormik({
        initialValues: {
            email: email,
            password: '',
            password2: ''
        },
        validationSchema: yup.object({
            email: safe_username(t),
            password: safe_password(t),
            password2: safe_password_repetition(t)
        }),
        enableReinitialize: true,
        onSubmit: ({email, password, password2}, {setStatus, setSubmitting}) => {
            setStatus();

            passwordResetService
                .reset(email, password, token, recaptcha)
                .then(...errorHandler({handle401: false}))
                .then(
                    function (result) {
                        enqueueSnackbar(t("reset_password_success"), {variant: "success"});
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
                        style={{height: "100%"}}>
                        <Grid item>
                            <Box m={2}>
                                <Paper className={classes.paper}>
                                    <img src={themeCtx.theme? "logo_centrifuga4_dark.svg": "logo_centrifuga4_light.svg"} alt="Logo Centrífuga" style={{height: "85px"}}/>

                                     <Box m={2}>
                                         <Typography>{t("new_password")}</Typography>
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
                                        <ReCAPTCHA sitekey={RECAPTCHA}
                                                 onChange={onChange}
                                                 theme={themeCtx.theme? "dark": "light"}
                                                 className={classes.recaptcha}
                                      />
                                        <Box my={3}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                disabled={formik.isSubmitting || recaptcha==null}
                                                className={classes.field}>
                                                {t("change_password")}
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