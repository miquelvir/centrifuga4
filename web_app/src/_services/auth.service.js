import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";

export const authenticationService = {
    login,
    logout,
    ping
};

function login(username, password, totp, rememberMe=false) {
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/auth/v1/login?totp=${totp}&rememberMe=${rememberMe? 1:0}`,
            method: 'POST',
            auth: {
                username: username,
                password: password
            },
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(res => {
            resolve({logged: true, needs: res["data"]});
        }).catch(function (res) {
            try { if (res["response"]["status"] === 401) resolve({logged: false}) } catch(err){}
            reject(res);
        });
    });
}

function logout() {
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/auth/v1/logout`,
            method: 'GET',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(response => {
            resolve(false);
        }).catch(function (err) {
            reject(err);
        });});
}

function ping() {
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/auth/v1/ping`,
            method: 'GET',
            headers: {'Cache-Control': 'no-cache'}
        }).then(res => {
            resolve({isLoggedIn: true, needs: res.data});
        }).catch(function (res) {
            try { if (res["response"]["status"] === 401) resolve({isLoggedIn: false, needs: null}) } catch(err){}

            reject(res);
        });});
}