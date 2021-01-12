import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";

export const invitationsService = {
    inviteUser
};

function inviteUser(userEmail, needs) {
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/invites/v1/userInvite`,  // todo server url
            method: 'POST',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()},
            data: {
                userEmail: userEmail,
                needs: needs
            }
        }).then(res => {
            resolve(true);
        }).catch(function (res) {
            reject(res);
        });
    });
}
