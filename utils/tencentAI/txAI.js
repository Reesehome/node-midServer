const qs = require('querystring');
const https = require('https');

const auth = require('./auth');
const conf = require('./conf');

/**
 * return the status message 
 */
const statusText = (status) => {
  let statusText = 'unkown';
  switch (status) {
    case 200:
      statusText = 'HTTP OK';
      break;
    case 400:
      statusText = 'Bad Request';
      break;
    case 401:
      statusText = 'Unauthorized';
      break;
    case 403:
      statusText = 'Forbidden';
      break;
    case 500:
      statusText = 'Internal Server Error';
      break;
  }
  return statusText;
};

const getrequest = (params, callback) => {
  return https.request(params, (res) => {
    if (res.statusCode != 200) {
      callback({ 'httpcode': res.statusCode, 'message': statusText(res.statusCode), 'data': {} });
      return;
    }
    let body = '';
    res.setEncoding('utf-8');
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      callback({ 'httpcode': res.statusCode, 'message': statusText(res.statusCode), 'data': JSON.parse(body) });
    });
    res.on('error', function (e) {
      callback({ 'httpcode': res.statusCode, 'message': '' + e, 'data': {} });
    });
  });
};

/**
 * 身份证OCR
*/
exports.idcardocr = async (imagePath, cardType, callback) => {
  callback || console.log(e);
  const params = { 'card_type': cardType };
  const request_body = await auth.getAllParams(params, imagePath);
  const opt = {
    host: conf.API_TXAI_SERVER,
    post: conf.API_TXAI_PORT,
    path: '/fcgi-bin/ocr/ocr_idcardocr',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  const request = getrequest (opt, callback);
  request.end(qs.stringify(request_body));
}

/**
 * 人脸识别face_detectface
*/
exports.detectface = async (imagePath, mode, callback) => {
  callback || console.log(e);
  const params = { 'mode': mode }
  const request_body = await auth.getAllParams(params, imagePath);
  const opt = {
    host: conf.API_TXAI_SERVER,
    post: conf.API_TXAI_PORT,
    path: '/fcgi-bin/face/face_detectface',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  const request = getrequest (opt, callback);
  request.end(qs.stringify(request_body));
}

/**
 * 
 * 
*/
