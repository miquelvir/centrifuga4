import { BehaviorSubject } from 'rxjs';
import { handleResponse } from '../_helpers/handle-response';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('csrf_token')));

export const authenticationService = {
    login,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value }
};

function login(username, password) {
    const requestOptions = {
        method: 'GET',
        auth: {
            username: username,
            password: password
        }
    };

    return fetch(`https://127.0.0.1:4999/auth/v1/login`, requestOptions)
        .then(handleResponse)
        .then(response => {
            currentUserSubject.next(true);
            return true;
        });
}

function logout() {
    currentUserSubject.next(null);
}