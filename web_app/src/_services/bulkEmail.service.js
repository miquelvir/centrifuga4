import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";

export const bulkEmailService = {
    bulkSend
};

function bulkSend(courseIds, subject, body, emailPreference, files) {
    const data = new FormData();
    data.append("courseIds", JSON.stringify(courseIds));
    data.append("emailPreference", emailPreference);
    data.append("subject", subject);
    data.append("body", body);
    files.forEach(f => {
        data.append(f.name, f);
    })
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/emails/v1/bulk`,  // todo server url
            method: 'POST',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()},
            data: data
        }).then(res => {
            resolve(true);
        }).catch(function (res) {
            reject(res);
        });
    });
}
