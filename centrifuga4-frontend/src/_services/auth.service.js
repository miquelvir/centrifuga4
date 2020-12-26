import axios from "axios";

export const authenticationService = {
    login,
    logout
};

function login(username, password) {

    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/auth/v1/login',
            method: 'GET',
            auth: {
                username: username,
                password: password
            }
        }).then(response => {
            resolve(true);
        }).catch(function (err) {
            reject(Error(err));
        });
    });
}

function logout() {
    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/auth/v1/logout',
            method: 'GET'
        }).then(response => {
            resolve(false);
        }).catch(function (err) {
            reject(Error(err));
        });});
}