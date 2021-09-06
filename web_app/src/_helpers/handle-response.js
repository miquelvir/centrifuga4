import {userContext} from "../_context/user-context";
import React from 'react';
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {Button} from "@material-ui/core";


export function useErrorHandler() {

    const userCtx = React.useContext(userContext);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const {t} = useTranslation();

    const successHandler = (res, snackbarSuccess) => {
        if (snackbarSuccess) enqueueSnackbar(t("success"), {variant: "success"});
        return Promise.resolve(res);
    }

    const successHandlerFactory = (snackbarSuccess) => {
        return (res) => successHandler(res, snackbarSuccess)
    }

    const failureHandler401 = (res) => {
        // auto logout if 401 unauthenticated
        userCtx["setUser"]({logged: false, ping: false});

        enqueueSnackbar(t("warning_not_logged_in"), {variant: "warning"});

        return Promise.reject(res);
    }

    const failureHandler403 = (res) => {
        // unauthorized
        enqueueSnackbar(t("warning_not_enough_privileges"), {variant: "warning"});

        return Promise.reject(res);
    }

    const failureHandlerUnexpected = (res, reportUnexpected) => {
        // an unexpected error happened
        if (res.request.responseType == 'blob'){
            res.response.data.text().then(res => {
                showSnackbar(JSON.parse(res)['message']);
            });
        } else {
            showSnackbar('');
        }
        
        const showSnackbar = (message) => {
            enqueueSnackbar(`Something went wrong! 😣 ${message}`,
            {
                variant: "error",
                autoHideDuration: 10000,
                action: key => {
                    return <React.Fragment>
                        <img src={true ? "logo_centrifuga4_dark_error.svg" : "logo_centrifuga4_light_error.svg"}
                             alt="Logo Centrífuga" style={{height: "35px"}}/>

                        {reportUnexpected? <Button onClick={() => {
                            navigator.clipboard.writeText(
                                "TO: vazquezrius.miquel@gmail.com\n\n" +
                                "To mark an item, use a cross, like this: [X]\n\n" +
                                "🛎️ TRIAGE\n" +
                                "[ ] This issue has been reported previously and has NOT been marked as solved\n" +
                                "[ ] This issue has been reported previously and has been marked as solved\n" +
                                "[ ] This issue has not been reported previously\n" +
                                "[ ] I have written the steps to reproduce the issue in the specified section below - ⚠️required!\n\n" +
                                "🙋 TYPE OF REQUEST\n" +
                                "[ ] Feature request\n" +
                                "[X] Error report\n\n" +
                                "📋 STEPS\n" +
                                "Describe what were you doing when this error happened!\n" +
                                "\n    example\n" +
                                "    1. Searched 'john' in the students section, two students appeared.\n" +
                                "    2. Clicked the CSV export option.\n" +
                                "    3. Nothing happened, the the error message appeared.\n\n" +
                                "Write your steps for repeating the issue here:\n1. ...\n\n\n" +
                                "📚 STACK TRACE\n" + JSON.stringify(res) + "\n\n\n" +
                                "🌩️ RESPONSE\n" + JSON.stringify(res.response) + "\n\n\n" +
                                "⚙️ DEVICE CONTEXT\n" + navigator.platform + "\n" + navigator.userAgent + "\n" +
                                navigator.appVersion + "\n" + navigator.vendor + "\n")
                                .then(r => {
                                    closeSnackbar(key);
                                    alert("Okey, so something got messed up... 😣 Let's fix it!\n\n" +
                                        "📤 Open your email client\n" +
                                        "📋 Ctrl+V\n" +
                                        "✏️ Fill in the details\n" +
                                        "📨 Send it to the support team!\n\n")
                                });
                        }}>
                            {t("Report")}
                        </Button>: null}
                        <Button onClick={() => {
                            closeSnackbar(key)
                        }}>
                            {t("Dismiss")}
                        </Button>

                    </React.Fragment>
                }
            });
        }

        return Promise.reject(res);
    }

    const failureHandler = (res, handle401, handle403, handle400, errorOut, reportUnexpected) => {
        // decide which handler is going to handle the error response depending on status code
        let handler = (res) => failureHandlerUnexpected(res, reportUnexpected);
        if (res.request.status === 401) {
            if (handle401) { handler = failureHandler401; }
            else { return Promise.reject(res) }
        }
        if (res.request.status === 403) {
            if (handle403) { handler = failureHandler403; }
            else { return Promise.reject(res) }
        }
        if (res.request.status === 400) {
            if (!handle400) { return Promise.reject(res) }
            // else just use the default handler
        }

        // use the handler, return a rejected promise if errorOut,
        // else just execute the handler but don't return a rejected catch
        // (otherwise there will be either empty rejection handlers or unhandled rejections everywhere)
        if (errorOut) {
            return handler(res);
        } else {
            handler(res).catch(()=>{});  // ignores the rejection response
            return null;
        }
    }

    const failureHandlerFactory = (handle401, handle403, handle400, errorOut, reportUnexpected) => {
        return (res) => (failureHandler(res, handle401, handle403, handle400, errorOut, reportUnexpected))
    }

    return ({
                handle401 = true,
                handle403 = true,
                handle400 = true,
                errorOut = true,
                reportUnexpected = true,
                snackbarSuccess = false
            }) => {
        return [successHandlerFactory(snackbarSuccess),
                failureHandlerFactory(handle401, handle403, handle400, errorOut, reportUnexpected)]
    };
}