import axios from "axios";
import {authHeader} from "../_helpers/auth-header";
import {API_VERSION, BACKEND_URL} from "../config";

export const preEnrollmentService = {
    getCourses
};

function getCourses() {
        return new Promise(function (resolve, reject) {

            axios({
                method: 'get',
                url: `${BACKEND_URL}/pre-enrollment/v1/courses`,
                headers: {
                    ...{
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }, ...authHeader()  // todo are auth headers needed for gets?
                }
            }).then(function (response) {
                    resolve(response.data);
                }).catch(function (err) {
                    reject(err);
            });
        });
    }
