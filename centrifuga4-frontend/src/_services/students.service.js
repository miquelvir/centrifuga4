import {authHeader} from "../_helpers/auth-header";

const axios = require('axios');

class StudentsDataService {

  getAll(searchText, download=false, page=1) {
      const res = '/students';
      console.log(download);
      if (download){
          return new Promise(function(resolve, reject) {
              axios({
                  url: 'https://127.0.0.1:4999/api/v1/students',
                  method: 'GET',
                  responseType: 'blob', // important
                  params: {
                      "filter.full_name.like": '%' + searchText + '%',
                      "page": page
                  },
                  headers: {...{
                      'Accept': 'text/csv',
                      'Cache-Control': 'no-cache'
                  }, ...authHeader()}
              }).then(response => {
                  console.log(response);
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
                  console.log("0" + err);
                reject(Error(err));
              });
          });
      }
      console.log("hirooo");
      return new Promise(function(resolve, reject) {
          axios({
              method: 'get',
              url: 'https://127.0.0.1:4999/api/v1/students',
              params: {
                  "filter.full_name.like": '%' + searchText + '%',
                  "page": page
              },
              headers: {...{
                  'Content-Type': 'application/json',
                      'Cache-Control': 'no-cache'
              }, ...authHeader()}
            })
              .then(function (response) {
                  console.log("hiro", response, response.data);
                resolve(response.data);
              }).catch(function (err) {
                  console.log("hiro2", err);
              reject(err);
          });
        });
  }

  // other CRUD methods
}

export default new StudentsDataService();