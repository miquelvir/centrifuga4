import { authenticationService } from '../_services/auth.service';
import {userContext} from "../_context/user-context";
import React from 'react';
import report from "../_components/snackbar.report";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";

export function useErrorHandler() {

    const userCtx = React.useContext(userContext);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const {t} = useTranslation();

    const successHandler = (res) => {
        console.log("succ");
        return Promise.resolve(res);
    }

    const failureHandler = (res) => {
        console.log("err", res.request.status);
        if (res.request.status === 401) {
            console.log("errr");
            // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
            userCtx["setUser"]({logged: false});

            enqueueSnackbar("You are not logged in! 💂", { variant: "warning"});

            return Promise.reject(res);
        }

        enqueueSnackbar("Something went wrong! 😣",
                    {
                        variant: "error",
                        autoHideDuration: 10000,
                        action: key => {
                            return report(key, closeSnackbar, t, res)
                        }
                    });

        return Promise.reject(res);
    }

    return [successHandler, failureHandler];
}