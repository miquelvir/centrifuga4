import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {BACKEND_URL} from "../config";

export const attendanceService = {
    get, put
};

function get(courseId, date=null) {
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/api/v1/courses/${courseId}/attendance`,
            method: 'GET',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()},
            params:date === null? {}: {
                date: date
            },
        }).then(res => {
            resolve(res);
        }).catch(function (res) {
            reject(res);
        });
    });
}


function put(courseId, date, attendedStudentIds) {
    return new Promise(function(resolve, reject) {
        axios({url: `${BACKEND_URL}/api/v1/courses/${courseId}/attendance`,
            method: 'PUT',
            headers: {...{'Cache-Control': 'no-cache'}, ...authHeader()},
            data: {
                date: date,
                students: attendedStudentIds
            },
        }).then(res => {
            resolve(res);
        }).catch(function (res) {
            reject(res);
        });
    });
}
