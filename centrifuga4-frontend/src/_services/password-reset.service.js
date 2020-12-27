import axios from "axios";

export const passwordResetService = {
    reset,
    startReset
};

function reset(username, password, token) {

    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/password-reset/v1/newPassword',
            method: 'POST',
            data: {
                username: username,
                password: password,
                token: token
            }
        }).then(response => {
            resolve(true);
        }).catch(function (err) {
            reject(err);
        });
    });
}

function startReset(username) {

    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/password-reset/v1/passwordReset',
            method: 'POST',
            data: {
                username: username
            }
        }).then(response => {
            resolve(true);
        }).catch(function (err) {
            reject(err);
        });
    });
}
