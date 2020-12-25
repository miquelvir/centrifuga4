import { authenticationService } from '../_services/auth.service';

export function handleResponse(response) {
    console.log(response);
    if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                authenticationService.logout();
                // window.location.reload();
            }

            return Promise.reject(response);
        }

    return response;
}