import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";

export const authenticationService = {
    signup
};

function signup(username, password, email, name, surname1, surname2, token) {

    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/user-invites/v1/redeem`,
            method: 'POST',
            data: {
                password: password,
                email: email,
                name: name,
                surname1: surname1,
                surname2: surname2,
                token: token
            },
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(response => {
            resolve(response.data);
        }).catch(function (err) {
            reject(err);
        });
    });
}
