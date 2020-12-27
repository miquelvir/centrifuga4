import axios from "axios";

export const authenticationService = {
    signup
};

function signup(username, password, email, name, surname1, surname2, token) {

    return new Promise(function(resolve, reject) {
        axios({url: 'https://127.0.0.1:4999/invites/v1/newUser',
            method: 'POST',
            data: {
                username: username,
                password: password,
                email: email,
                name: name,
                surname1: surname1,
                surname2: surname2,
                token: token
            }
        }).then(response => {
            resolve(true);
        }).catch(function (err) {
            reject(err);
        });
    });
}
