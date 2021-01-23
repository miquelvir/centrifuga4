import {authHeader} from "../_helpers/auth-header";
import {API_VERSION, BACKEND_URL} from "../config";

const axios = require('axios');  // todo default headers

export default function serviceFactory(resource, subresource=null){  // todo subresource for all methods?
    return class {
        resource = resource;
        subresource = subresource;

        getAll(likeSearchText=null, page = 1, include=null, filters=null) {
            return new Promise(function (resolve, reject) {

                let myFilters = {
                        "page": page,
                        "include": include === null? null: JSON.stringify(include)
                    };
                if (likeSearchText !== null) {
                    myFilters[`filter.${likeSearchText.name}.like`] = '%' + likeSearchText.value + '%';
                }

                if (filters !== null) {
                    Object.keys(filters).forEach((key) => {
                    myFilters[`filter.${key}.eq`] = filters[key];
                })
                }

                axios({
                    method: 'get',
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}`,
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

        getOne(id, include=null) {
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'get',
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}/${id}`,
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
            return Promise.all(ids.map(id => (this.getOne(id))));
        }
        patch({id, body, initial_values = null}) {
            if (initial_values !== null) {
                for (const [key, value] of Object.entries(body)) {
                  if (key in initial_values && initial_values[key] === value){
                      delete body[key];  // unchanged value, no need to patch it
                  }
                }
            }

            if ("id" in body) {
                delete body["id"];  // no id is to be sent in the body, since it is sent as url param
            }
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'patch',
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}/${id}`,
                    data: body,
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
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}${subresource !== null? `/${subresourcId}/${subresource}`: ''}`,
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

        postWithId(id, subresourceid=null) {
            return new Promise(function (resolve, reject) {
                axios({
                    method: 'post',
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}/${id}${subresourceid === null?
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
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}/${id}${subresource !== null? `/${subresource}/${subresourceId}`: ''}`,
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

        downloadCsv(likeSearchText=null, page = 1, filters=null) {
            return new Promise(function (resolve, reject) {
                let myFilters = {
                       "filter.full_name.like": likeSearchText === null? null: `%${likeSearchText}%`,
                        "page": page
                    };
                if (filters !== null){
                    Object.keys(filters).forEach((key) => {
                    myFilters[`filter.${key}.eq`] = filters[key];
                })
                }

                axios({
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}`,
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
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}/${id}`,
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


        downloadSubresource(id, subresource) {
            return new Promise(function (resolve, reject) {
                axios({
                    url: `${BACKEND_URL}/api/${API_VERSION}/${resource}/${id}/${subresource}`,
                    method: 'POST',
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
