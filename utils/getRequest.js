const http = require('http');
const https = require('https');

let getRequest = (protocol, opt, callback) => {
  return protocol.request(opt, (response) => {
    let data = '';
    response.setEncoding('utf8')
    response.on('data', (chunk) => {
      data += chunk;
    })
    response.on('end', () => {
      callback(JSON.parse(data));
    })
    response.on('error', (e) => {
      callback('errorMsg: ' + e)
    })
  }).on('error', (e) => {
    callback('errorMsg: ' + e)
  })
}
module.exports = getRequest