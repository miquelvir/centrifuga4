fs = require('fs');
const data = fs.readFileSync("build/index.html", "utf8");
const dataScriptNonce = data.replace(/<script/g, "<script nonce=\"{{csp_nonce()}}\"");
const dataStyleNonce = dataScriptNonce.replace(/<link/g, "<link nonce=\"{{csp_nonce()}}\"");
fs.writeFileSync("build/index.html", dataStyleNonce);