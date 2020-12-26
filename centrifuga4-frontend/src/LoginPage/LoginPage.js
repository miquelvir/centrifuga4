import React from 'react';
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
        padding: "50px",
        margin: "auto"
    }
}));

const LoginPage = (props) => {
    const classes = useStyles();
    const userCtx = React.useContext(userContext);
    const {t} = useTranslation();
    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: yup.object({
            username: yup.string().required('Email is required').email('Enter a valid email.'),
            password: yup.string().required('Password is required')
        }),
        enableReinitialize: true,
        onSubmit: ({username, password}, {setStatus, setSubmitting}) => {
            setStatus();
            authenticationService.login(username, password)
                .then(
                    function (result) {
                        const {from} = props.location.state || {from: {pathname: "/"}};
                        props.history.push(from);
                        const setLogged = userCtx["setUser"];
                        setLogged({logged: true});
                    },
                    function (error) {
                        console.log(">>><<<", error);
                        setSubmitting(false);
                        setStatus(error);
                    });
        }
    });

    if (userCtx["user"]["logged"]) {
        props.history.push('/');
        return null;
    }

    return (
        <div className={classes.root}>
            <Grid container>
                <Grid xs={4} item>
                    <Grid
    container
    spacing={0}
    align="center"
    justify="center"
    direction="column"
    style={{ height: "100%" }}
  >
    <Grid item>
        <img src="dark_nf.png" alt="Italian Trulli" style={{height: "100vh"}}/></Grid></Grid>
                </Grid>
                <Grid xs={8} item>
                    <Grid
    container
    spacing={0}
    align="center"
    justify="center"
    direction="column"
    style={{ height: "100%" }}
  >
    <Grid item>
      <Box m={2}>
                        <Paper className={classes.paper}>

                                <form onSubmit={formik.handleSubmit}>
                                    <img src="favicon.png" alt="Italian Trulli" style={{width: "75px"}}/>
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
                                        {t("log in")}
                                    </Button>
                                        </Box>
                                </form></Paper></Box>
    </Grid>
  </Grid>
                </Grid>
            </Grid></div>);

}

export default LoginPage;