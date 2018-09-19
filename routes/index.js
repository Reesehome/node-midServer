var express = require('express');
var router = express.Router();
var http = require('http');
var qs = require('querystring');
var fs = require('fs')
var config = require('../config');
var formidable = require('formidable')
var path = require('path')
var dataHandle = require('../utils/dataHandle');
var getRequest = require('../utils/getRequest')
var imageHandle = require('../utils/imageHandle');
var errcodeHandle = require('../utils/errcodeHandle');
var tencentyoutuyun = require('../lib/nodejs_sdk');
var tencentconf = tencentyoutuyun.conf;
var youtu = tencentyoutuyun.youtu;

var sharp = require('sharp')

// 初始化腾讯优图sdk对象
var appid = '1000000000000'; //#gitignore
var secretId = 'xxxxxxxxxxxxx'; //#gitignore
var secretKey = 'xxxxxxxxxxxx'; //#gitignore
var userid = '12341234'; // QQ //#gitignore
tencentconf.setAppInfo(appid, secretId, secretKey, userid, 0)

// 获取token 以及 登录
router.post('/oauth/token', function (request, response) {
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
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  // 写入数据到请求主体
  req.end(qs.stringify(request.body));
});

// 获取登录验证码
router.patch('/api/candidate/resetPwd', function (request, response) {
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
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  req.write(JSON.stringify(request.body)) // {"mobile":"13246824898"}
  // req.write(qs.stringify(request.body)) // mobile=13246824898。这里的content-type：application/json.因此body需要的是json格式
  req.end();
})

// 注册新用户
router.post('/api/candidate', function (request, response) {
  var opt = {
    method: request.method,
    host: config.API.HOST,
    port: config.API.POST,
    path: request.path,
    headers: {
      "Authorization": request.headers['authorization']
    }
  };
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  req.end(qs.stringify(request.body));
});

// 获取注册验证码
router.post('/api/verifier_code', function (request, response) {
  var opt = {
    method: request.method,
    host: config.API.HOST,
    port: config.API.POST,
    path: request.path,
    headers: {
      "Authorization": request.headers['authorization']
    }
  };
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  req.end(qs.stringify(request.body));
});

// 获取最新考试
router.get('/api/application/opinion', function (request, response) {
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    method: request.method,
    path: request.url,
    headers: {
      "Authorization": request.headers['authorization']
    }
  }
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  req.end();
})

// 获取考试列表
router.get('/api/application', function (request, response) {
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    method: request.method,
    headers: {
      "Authorization": request.headers['authorization']
    }
  }
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  req.end();
})

// 获取某一条考试 (url动态参数写法)
router.get('/api/application/:application_id', function (request, response) {
  var opt = {
    host: config.API.HOST,
    port: config.API.POST,
    path: request.url,
    method: request.method,
    headers: {
      "Authorization": request.headers['authorization']
    }
  }
  var req = getRequest(http, opt, (res) => {
    response.send(res);
  })
  req.end();
})

// 上传图片
router.post('/api/attachment', (request, response) => {
  // var _data = '';
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
    fields.push([field, value]);
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
    file.name = avatarName;
    file.path = newPath; // 修改文件路径即可更改上传的文件
    files.push([field, file]);
  }).on("end", () => {
    // 身份证正面照片
    if (fields[0][1] === 'idcard_front') {
      youtu.idcardocr(newPath, 0, function (data) {
        if (data.code === 200) {
          if (data.data.errorcode === 0) {
            dataHandle.base64_decode(data.data.frontimage, newPath);
            // 发送最新图片请求
            var req = getRequest(http, opt, (res) => {
              response.send(res);
            })
            imageHandle.uploadFile(files, req, fields);
          } else {
            var errmsg = errcodeHandle.transErrcode(data.data.errorcode)
            response.send({ code: 'node:imageRecognizeFail', message: errmsg })
          }
        } else {
          response.send({ code: 'node:imageRecognizeFail ' + data.code, message: '内部错误，请联系管理员!' })
        }
      })
    }
    // 身份证反面照片
    if (fields[0][1] === 'idcard_back') {
      youtu.idcardocr(newPath, 1, function (data) {
        if (data.code === 200) {
          if (data.data.errorcode === 0) {
            dataHandle.base64_decode(data.data.backimage, newPath);
            // 发送最新图片请求
            var req = getRequest(http, opt, (res) => {
              response.send(res);
            })
            imageHandle.uploadFile(files, req, fields);
          } else {
            var errmsg = errcodeHandle.transErrcode(data.data.errorcode)
            response.send({ code: 'node:imageRecognizeFail', message: errmsg })
          }
        } else {
          response.send({ code: 'node:imageRecognizeFail ' + data.code, message: '内部错误，请联系管理员!' })
        }
      })
    }
    // 本人声明
    if (fields[0][1] === 'declare') {
      // 发送最新图片请求
      var req = getRequest(http, opt, (res) => {
        response.send(res);
      })
      imageHandle.uploadFile(files, req, fields);
    }
    // 一寸彩照
    if (fields[0][1] === 'photo') {
      youtu.detectface(newPath, 1, function (data) {
        if (data.code === 200) {
          if (data.data.errorcode === 0) {

            // 裁剪头像（一寸照片25mm * 35mm）
            var left = data.data.face[0].x;
            var top = data.data.face[0].y;
            var faceWidth = data.data.face[0].width;
            var faceHeight = data.data.face[0].height;

            var imgWidth = data.data.image_width;
            var imgHeight = data.data.image_height;

            // 判断是否一寸照片
            if (faceWidth * faceHeight * 2 <= imgWidth * imgHeight / 3) {
              console.log('头像图片不合规范，请上传扫描件')
            }

            // 获取头的高度
            var headHeight = faceHeight * 2 > imgHeight ? imgHeight : parseInt(faceHeight * 2)
            var DHeight = imgHeight - headHeight
            
            // 获取头的宽度
            var headWidth = faceWidth * 3/2 > imgWidth ? imgWidth : parseInt(faceWidth * 3/2)
            var DWidth = imgWidth - headWidth

            // 获取头的坐标
            top = top - faceHeight * 1/2 <= 0 ? 0 : parseInt(top - faceHeight * 1/2)
            left = left - faceWidth * 1/4 <= 0 ? 0 : parseInt(left - faceWidth * 1/4)

            if (DHeight - top < 0) {
              top = DHeight/2
            }
            if (DWidth - left < 0) {
              left = DWidth/2
            }
            var outPath = path.join(__dirname, '/output') + '/output2_1.jpg'
            var imgExists = fs.existsSync(newPath)
            if (imgExists) {
              sharp(newPath)
                .extract({ left: left, top: top, width: headWidth, height: headHeight })
                .toFile(outPath, function (err) {
                  if (err) {
                    response.end('图片裁剪错误，请重新上传另一张照片')
                  }
                })
            }
            // dataHandle.base64_decode(data.data.backimage, newPath);
            // 发送最新图片请求
            // var req = getRequest(http, opt, (res) => {
            //   response.send(res);
            // })
            // imageHandle.uploadFile(files, req, fields);
          } else {
            var errmsg = errcodeHandle.transErrcode(data.data.errorcode)
            response.send({ code: 'node:imageRecognizeFail', message: errmsg })
          }
        } else {
          response.send({ code: 'node:imageRecognizeFail ' + data.code, message: '内部错误，请联系管理员!' })
        }
      })
    }
  })
  form.parse(request)
})

module.exports = router; 
