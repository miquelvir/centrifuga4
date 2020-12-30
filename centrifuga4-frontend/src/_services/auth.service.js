import axios from "axios";
import {authHeader} from "../_helpers/auth-header";

export const authenticationService = {
    login,
    logout,
    ping
};

function login(username, password) {
    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/auth/v1/login',  // todo server url
            method: 'POST',
            auth: {
                username: username,
                password: password
            },
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(res => {
            resolve(true);
        }).catch(function (res) {
            try { if (res["response"]["status"] === 401) resolve(false) } catch(err){}
            reject(res);
        });
    });
}

function logout() {
    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/auth/v1/logout',
            method: 'POST',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(response => {
            resolve(false);
        }).catch(function (err) {
            reject(err);
        });});
}

function ping() {
    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/auth/v1/ping',
            method: 'GET',
            headers: {'Cache-Control': 'no-cache'}
        }).then(res => {
            resolve(true);
        }).catch(function (res) {
            try { if (res["response"]["status"] === 401) resolve(false) } catch(err){}

            reject(res);
        });});
}