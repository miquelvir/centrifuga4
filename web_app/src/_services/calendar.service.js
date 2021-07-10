import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";


export function downloadCalendar(resource, resource_id, calendar_id) {

    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/calendars/v1/${resource}/${resource_id}/${calendar_id}`,
            method: 'GET',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()}
        }).then(response => {
            let filename = response.headers["content-disposition"].split("filename=")[1];
            if (filename === null) filename = "calendar.ics";

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            resolve();
        }).catch(function (err) {
            reject(err);
        });
    });
}
