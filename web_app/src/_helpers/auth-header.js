import Cookies from 'js-cookie';

export function authHeader() {
    // return authorization header with jwt token
    return { 'X-CSRFToken': Cookies.get('X-CSRF-TOKEN')};
}