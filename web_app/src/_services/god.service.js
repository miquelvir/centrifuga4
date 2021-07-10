import {API_VERSION, BACKEND_URL} from "../config";
import {authHeader} from "../_helpers/auth-header";
import axios from "axios";

export const downloadGodFile = () => {
    return new Promise(function (resolve, reject) {
    axios({
        url: `${BACKEND_URL}/api/${API_VERSION}/files/god`,
        method: 'POST',
        responseType: 'blob', // important
        headers: {
            ...{
                'Accept': 'text/csv',
                'Cache-Control': 'no-cache'
            }, ...authHeader()
        }
    }).then(response => {
        let filename = response.headers["content-disposition"].split("filename=")[1];
        if (filename === null) filename = "export.zip";

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