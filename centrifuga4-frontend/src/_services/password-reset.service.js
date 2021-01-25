import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";

export const passwordResetService = {
    reset,
    startReset
};

function reset(username, password, token, recaptcha) {

    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/password-reset/v1/newPassword`,
            method: 'POST',
            data: {
                email: username,
                password: password,
                token: token,
                recaptcha: recaptcha
            },
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(response => {
            resolve(true);
        }).catch(function (err) {
            reject(err);
        });
    });
}

function startReset(username, recaptcha) {

    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/password-reset/v1/passwordReset`,
            method: 'POST',
            data: {
                email: username,
                recaptcha: recaptcha
            },
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(response => {
            resolve(true);
        }).catch(function (err) {
            reject(err);
        });
    });
}
