import { authenticationService } from '../_services/auth.service';
import Cookies from 'js-cookie';

export function authHeader() {
    // return authorization header with jwt token
    return { 'X-CSRF-TOKEN': Cookies.get('X-CSRF-TOKEN')};
}