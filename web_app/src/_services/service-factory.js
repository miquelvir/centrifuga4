import {authHeader} from "../_helpers/auth-header";
import {API_VERSION, BACKEND_URL} from "../config";

const axios = require('axios');  // todo default headers

export default function serviceFactory(resource, subresource=null, serviceName=null, baseUrl=null, apiVersion=null){  // todo subresource for all methods?
    
    baseUrl = baseUrl === null? BACKEND_URL: baseUrl;
    serviceName = serviceName === null? 'api': serviceName;
    apiVersion = apiVersion === null? API_VERSION: apiVersion;
    const url = `${baseUrl}/${serviceName}/${apiVersion}`;

    return class {
        

        getAll(likeSearchText=null, page = 1, include=null, filters=null, parent_id=null) {
            return new Promise(function (resolve, reject) {

                let myFilters = {
                        "page": page,
                        "include": include === null? null: JSON.stringify(include)
                    };
                if (likeSearchText !== null) {
                    myFilters[`filter.${likeSearchText.name}.match`] = likeSearchText.value;
                }

                if (filters !== null) {
                    Object.keys(filters).forEach((key) => {
                    myFilters[`filter.${key}.eq`] = filters[key];
                })
                }
                
                axios({
                    method: 'get',
                    url: `${url}/${resource}${subresource===null? '': `/${parent_id}/${subresource}`}`,
                    params: myFilters,
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

        getOne(id, include=null, expect_batch=false) {
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'get',
                    url: `${url}/${resource}/${id}`,
                    params: {
                        "include": include === null? null: JSON.stringify(include)
                    },
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

        getMany(ids) {
            return new Promise((resolve, reject) => {
                if (ids.length === 0) {
                    resolve([]);
                }
                this.getOne(ids.join(','))
                    .then(res => {
                    if (ids.length === 1) {
                        resolve([res]);
                    } else {
                        resolve(res);
                    }
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        }

        patch({id, body, initial_values = null}) {
            if (initial_values !== null) {
                var dirtyBody = Object.keys(body).reduce(function (filtered, key) {
                    if (!(key in initial_values && initial_values[key] === body[key])){
                        filtered[key] = body[key];
                    }
                    return filtered;
                }, {});
            }

            if ("id" in dirtyBody) {
                delete dirtyBody["id"];  // no id is to be sent in the body, since it is sent as url param
            }
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'patch',
                    url: `${url}/${resource}/${id}`,
                    data: dirtyBody,
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

        post(body, subresourcId=null) {
            if ("id" in body) delete body["id"];  // no id is to be sent in the body, since it is sent as url param

            return new Promise(function (resolve, reject) {
                axios({
                    method: 'post',
                    url: `${url}/${resource}${subresource !== null? `/${subresourcId}/${subresource}`: ''}`,
                    data: body,
                    headers: {
                        ...{
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(function (res) {
                        resolve(res.data);
                    }).catch(function (err) {
                        reject(err);
                });
            });
        }

        // todo arent post and postwith id nearly same? merge

        postWithId(id, subresourceid=null) {
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'post',
                    url: `${url}/${resource}/${id}${subresourceid === null?
                    '': `/${subresource}/${subresourceid}`}`,
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
        }

        delete(id, subresourceId=null) {
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'delete',
                    url: `${url}/${resource}/${id}${subresource !== null? `/${subresource}/${subresourceId}`: ''}`,
                    headers: {
                        ...{
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(function (response) {
                        resolve(response);
                    }).catch(function (err) {
                        reject(err);
                });
            });
        }

        deleteMany(ids) {
            return Promise.all(ids.map(id => (this.delete(id))));
        }

        downloadCsv(searchtermfield, searchterm, page = 1, filters=null) {
            return new Promise(function (resolve, reject) {
                let myFilters = {
                        "page": page
                    };

                if (searchtermfield !== null){
                    myFilters[`filter.${searchtermfield}.like`]= `%${searchterm}%`;
                }

                if (filters !== null){
                    Object.keys(filters).forEach((key) => {
                    myFilters[`filter.${key}.eq`] = filters[key];
                })
                }

                axios({
                    url: `${url}/${resource}`,
                    method: 'GET',
                    responseType: 'blob', // important
                    params: myFilters,
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


        downloadOneCsv(id) {
            return new Promise(function (resolve, reject) {
                axios({
                    url: `${url}/${resource}/${id}`,
                    method: 'GET',
                    responseType: 'blob', // important
                    headers: {
                        ...{
                            'Accept': 'text/csv',
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(response => {
                    /*
                    _download(response){
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
        }
                    **/
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


        downloadSubresource(id, subresource, params) {
            return new Promise(function (resolve, reject) {
                axios({
                    url: `${url}/${resource}/${id}/${subresource}`,
                    method: 'POST',
                    params: params,
                    responseType: 'blob', // important
                    headers: {
                        ...{
                            'Cache-Control': 'no-cache'
                        }, ...authHeader()
                    }
                }).then(response => {
                    let filename = response.headers["content-disposition"].split("filename=")[1];
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
