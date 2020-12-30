import {authHeader} from "../_helpers/auth-header";
import {API_VERSION, BACKEND_URL} from "../config";

const axios = require('axios');  // todo default headers

export default function serviceFactory(resource){
    return class {
        resource = resource;

        constructor(){}

        getAll(likeSearchText=null, page = 1) {
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'get',
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}`,
                    params: {
                        "filter.full_name.like": likeSearchText === null? null: `%${likeSearchText}%`,
                        "page": page
                    },
                    headers: {
                        ...{
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(function (response) {
                        resolve(response.data);
                    }).catch(function (err) {
                        reject(err);
                });
            });
        }

        downloadAllCsv(likeSearchText=null, page = 1) {
            return new Promise(function (resolve, reject) {
                axios({
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}`,
                    method: 'GET',
                    responseType: 'blob', // important
                    params: {
                        "filter.full_name.like": likeSearchText === null? null: `%${likeSearchText}%`,
                        "page": page
                    },
                    headers: {
                        ...{
                            'Accept': 'text/csv',
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(response => {
                    let filename = response.headers["content-disposition"].split("filename=")[1];
                    if (filename === null) filename = "export.csv";

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
    }
}
