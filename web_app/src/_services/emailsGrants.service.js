import serviceFactory from "./service-factory";
import {API_VERSION, BACKEND_URL} from "../config";
import {authHeader} from "../_helpers/auth-header";
import axios from "axios";


export const sendGrantEmail = (id) => {  // todo abstract
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'post',
                    url: `${BACKEND_URL}/emails/v1/grantEmail/${id}`,
                    headers: {
                        ...{
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(function (res) {
                        resolve(res);
                    }).catch(function (err) {
                        reject(err);
                });
            });
        };

