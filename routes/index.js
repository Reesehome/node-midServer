var express = require('express');
var router = express.Router();
var http = require('http');
var qs = require('querystring');
var fs = require('fs')
var config = require('../config');
var formidable = require('formidable')
var path = require('path')
var txAI = require('../utils/tencentAI/txAI.js');
var dataHandle = require('../utils/dataHandle.js');

// 获取token 以及 登录
router.post('/oauth/token', function (request, response) {
  var _data = '';
  var opt = {
    method: request.method,
    host: config.API.HOST,
    port: config.API.POST,
    path: request.path,
    headers: {
      "Authorization": request.headers['authorization'],
      "Content-Type": request.headers['content-type']
    }
  };
  var req = http.request(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', (e) => {
    // console.log("Got error: " + e.message)
  });
  // 写入数据到请求主体
  req.end(qs.stringify(request.body));
});

// 获取登录验证码
router.patch('/api/candidate/resetPwd', function (request, response) {
  var _data = '';
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    method: request.method,
    headers: {
      "Authorization": request.headers['authorization'],
      "Content-Type": request.headers['content-type']
    }
  }
  var req = http.request(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', e => {
    // console.log("Got error: " + e.message)
  });
  req.write(JSON.stringify(request.body)) // {"mobile":"13246824898"}
  // req.write(qs.stringify(request.body)) // mobile=13246824898。这里的content-type：application/json.因此body需要的是json格式
  req.end();
})

// 注册新用户
router.post('/api/candidate', function (request, response) {
  var _data = '';
  var opt = {
    method: request.method,
    host: config.API.HOST,
    port: config.API.POST,
    path: request.path,
    headers: {
      "Authorization": request.headers['authorization']
    }
  };
  var req = http.request(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', (e) => {
    // console.log("Got error: " + e.message)
  });
  req.end(qs.stringify(request.body));
});

// 获取注册验证码
router.post('/api/verifier_code', function (request, response) {
  var _data = '';
  var opt = {
    method: request.method,
    host: config.API.HOST,
    port: config.API.POST,
    path: request.path,
    headers: {
      "Authorization": request.headers['authorization']
    }
  };
  var req = http.request(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', (e) => {
    // console.log("Got error: " + e.message)
  });
  req.end(qs.stringify(request.body));
});

// 获取最新考试
router.get('/api/application/opinion', function (request, response) {
  var _data = '';
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    headers: {
      "Authorization": request.headers['authorization']
    }
  }
  http.get(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', e => {
    // console.log("Got error: " + e.message)
  });
})

// 获取考试列表
router.get('/api/application', function (request, response) {
  var _data = '';
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    headers: {
      "Authorization": request.headers['authorization']
    }
  }
  http.get(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', e => {
    // console.log("Got error: " + e.message)
  });
})

// 获取某一条考试 (url动态参数写法)
router.get('/api/application/:application_id', function (request, response) {
  var _data = '';
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    headers: {
      "Authorization": request.headers['authorization']
    }
  }
  http.get(opt, (res) => {
    res.setEncoding('utf8')
      .on('data', (chunk) => {
        _data += chunk.toString();
      })
      .on('end', function () {
        response.send(_data)
      })
  }).on('error', e => {
    // console.log("Got error: " + e.message)
  });
})

// 上传图片
router.post('/api/attachment', (request, response) => {
  var _data = '';
  var files = [];
  var fields = [];
  var newPath;
  var opt = {
    method: request.method,
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    headers: {
      "Authorization": request.headers['authorization'],
      "Content-Type": request.headers['content-type']
    }
  }
  // 接受图片
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.uploadDir = path.join(__dirname + "/upload"); // 图片暂时存储的文件夹
  form.keepExtensions = true;//保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024;// 默认2M
  form.on("field", (field, value) => {
    fields.push([field, value])
  }).on("file", (field, file) => {
    // 处理图片
    var filename = file.name;
    var nameArray = filename.split('.');
    var type = nameArray[nameArray.length - 1];
    var name = '';
    for (var i = 0; i < nameArray.length - 1; i++) {
      name = name + nameArray[i];
    }
    var date = new Date();
    var time = '_' + date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getHours() + "_" + date.getMinutes();
    var avatarName = name + time + '.' + type;
    newPath = form.uploadDir + "/" + avatarName;
    fs.renameSync(file.path, newPath);  //重命名
    file.name = avatarName
    file.path = newPath // 修改文件路径即可更改上传的文件
    // var fileStream = fs.createWriteStream(newPath); // 不可这样修改文件流，否则浏览器显示不了图片
    // file._writeStream = fileStream
    files.push([field, file])
  }).on("end", () => {
    switch (fields[0][1]) {
      case 'idcard_front':
        txAI.idcardocr(newPath, 0, (res) => {
          if (res.httpcode === 200 && res.data.ret === 0 && res.data.data.frontimage) {
            dataHandle.base64_decode(res.data.data.frontimage, newPath)
            // 发送最新图片请求
            var req = http.request(opt, (res) => {
              res.setEncoding('utf8')
                .on('data', (chunk) => {
                  _data += chunk;
                })
                .on('end', function () {
                  response.send(_data)
                })
            }).on('error', (e) => {
              // console.log("Got error: " + e.message)
              response.end("内部错误，请联系管理员！msg:" + e)
            })
            uploadFile(files, req, fields)
          }
        });
        break;
      case 'idcard_back':
        txAI.idcardocr(newPath, 1, (res) => {
          if (res.httpcode === 200 && res.data.ret === 0 && res.data.data.backimage) {
            dataHandle.base64_decode(res.data.data.backimage, newPath)
            // 发送最新图片请求
            var req = http.request(opt, (res) => {
              res.setEncoding('utf8')
                .on('data', (chunk) => {
                  _data += chunk;
                })
                .on('end', function () {
                  response.send(_data)
                })
            }).on('error', (e) => {
              // console.log("Got error: " + e.message)
              response.end("内部错误，请联系管理员！msg:" + e)
            })
            uploadFile(files, req, fields)
          }
        });
        break;
      case 'photo':
        txAI.detectface(newPath, 1, (res) => {
          if (res.httpcode === 200 && res.data.ret === 0) {
            // dataHandle.base64_decode(res.data.data.backimage, newPath)
            // 发送最新图片请求
            var req = http.request(opt, (res) => {
              res.setEncoding('utf8')
                .on('data', (chunk) => {
                  _data += chunk;
                })
                .on('end', function () {
                  response.send(_data)
                })
            }).on('error', (e) => {
              // console.log("Got error: " + e.message)
              response.end("内部错误，请联系管理员！msg:" + e)
            })
            uploadFile(files, req, fields)
          }
        });
        break;
    }
  })
  form.parse(request)
})
function uploadFile(files, req, postData) {
  var boundaryKey = Math.random().toString(16);
  var endData = '\r\n----' + boundaryKey + '--';
  var filesLength = 0, content;
  // 初始数据，把post过来的数据都携带上去
  content = (function (obj) {
    var rslt = [];
    Object.keys(obj).forEach(function (key) {
      arr = ['\r\n----' + boundaryKey + '\r\n'];
      arr.push('Content-Disposition: form-data; name="' + obj[key][0] + '"\r\n\r\n');
      arr.push(obj[key][1]);
      rslt.push(arr.join(''));
    });
    return rslt.join('');
  })(postData);
  // 组装数据
  Object.keys(files).forEach(function (key) {
    if (!files.hasOwnProperty(key)) {
      delete files.key;
      return;
    }
    content += '\r\n----' + boundaryKey + '\r\n' +
      'Content-Type: application/octet-stream\r\n' +
      'Content-Disposition: form-data; name="' + files[key][0] + '"; ' +
      'filename="' + files[key][1].name + '"; \r\n' +
      'Content-Transfer-Encoding: binary\r\n\r\n';
    files[key].contentBinary = new Buffer(content, 'utf-8');;
    filesLength += files[key].contentBinary.length + fs.statSync(files[key][1].path).size;
  });
  req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
  req.setHeader('Content-Length', filesLength + Buffer.byteLength(endData));
  // 执行上传
  var allFiles = Object.keys(files);
  var fileNum = allFiles.length;
  var uploadedCount = 0;
  allFiles.forEach(function (key) {
    req.write(files[key].contentBinary);
    // console.log("files[key].path:" + files[key][1].path);
    var fileStream = fs.createReadStream(files[key][1].path, { bufferSize: 4 * 1024 });
    fileStream.on('end', function () {
      // 上传成功一个文件之后，把临时文件删了
      // fs.unlink(files[key][1].path);
      // uploadedCount++;
      // if (uploadedCount == fileNum) {
      // 如果已经是最后一个文件，那就正常结束
      req.end(endData);
      // }
    });
    fileStream.pipe(req, { end: false });
  });
}
module.exports = router; 
