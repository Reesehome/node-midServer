// 该文件是自己实现的腾讯ai接口的鉴权，tencentAI是学习了腾讯优图ai的sdk写法重新封装的。后期发现腾讯ai身份证识别不好用（比如旋转后的身份证无法识别，身份证正反面无法提示），因此转用腾讯优图ai,其已经为node封装好了sdk。即项目中的lib中tencentyoutu。此文件留存作为学习依据
var fs = require('fs')
var qs = require('querystring')
var crypto = require('crypto')
var https = require('https');

const txAPI = {
  /**
   * getReqSign ：根据 接口请求参数 和 应用密钥 计算 请求签名
   * @param params 接口请求参数（特别注意：不同的接口，参数对一般不一样，请以具体接口要求为准）
   * @param appkey 应用密钥
   */
  getReqSign: (params, appkey) => {
    // 1. 字典升序排序
    params = txAPI.sortParams(params);
    // 2. 拼按URL键值对
    var str = '';
    for (var key in params) {
      if (params[key] !== '') {
        str += `${key}=${encodeURIComponent(params[key])}&` // 此处必须要将/,=等字符编码，否则无法获取正确的sign
      }
    }
    // 3. 拼接app_key
    str += 'app_key=' + appkey;
    // 4. MD5运算+转换大写，得到请求签名
    var md5 = crypto.createHash('md5')
    md5.update(str)
    var sign = md5.digest('hex').toUpperCase()
    return sign
  },

  /**
   * base64编码和解码
   * 思路：
   *  s1、读取文件binary数据
   *  s2、将数据转换成base64字符串
  */
  base64_encode: (file) => {
    var bitmap = fs.readFileSync(file);
    var buffer = new Buffer(bitmap)
    return buffer.toString('base64');
  },
  base64_decode: (base64Str, file) => {
    var bitmap = new Buffer(base64Str, 'base64')
    fs.writeFileSync(file, bitmap)
  },

  /**
   * sortParams: 将传入的对象按照key升序规则排序
   * 实现思路：
   *  s1、获取对象中所有的key值
   *  s2、进行排序
   *  s3、将对应的value值取出来，并组成新的数组
   */
  sortParams: (obj) => {
    var newObj = {}
    var keysArr = Object.keys(obj).sort()
    keysArr.forEach(item => {
      newObj[item] = obj[item]
    })
    return newObj
  },

  /**
   * getRandomStr: 获取数字+英文小写的随机数
   * @param  len 随机数的长度
   * 实现思路：
   *  s1、有个所有数据的池子，得到数组的长度
   *  s2、随机获取数组的序号，得到数值
   *  s3、根据随机数的长度，得到字符串
   */
  getRandomStr: (len) => {
    var charArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    var charArrLen = charArr.length - 1
    var str = ''
    var randomIndex = ''
    for (var i = 0; i < len; i++) {
      randomIndex = Math.round(Math.random() * charArrLen)
      str += charArr[randomIndex]
    }
    return str
  },
  // 二、获取所有请求参数
  /**
   * getAllParams: 计算随机数，获取当前时间，计算图片base64数据 => 计算sign
   * @param params 传入请求的数据
   * @param imgPath 图片路径（绝对路径）
   * @param appkey 应用密钥
   * 
  */
  getAllParams: async (params, imgPath, appkey) => {
    try {
      // 异步获取各参数值，提高效率
      const [image, nonce_str, time_stamp] = await Promise.all([
        txAPI.base64_encode(imgPath), // 图片base64编码
        txAPI.getRandomStr(32), // 获取随机数
        Math.floor(Date.now() / 1000) // 获取当前时间戳
      ])
      // 默认数据
      const finalObj = {
        sign: '',
        app_id: '1000000', // 此处应为腾讯ai控制台中申请的app_id
        nonce_str,
        image,
        time_stamp
      }
      // 应用密钥
      const appkey = 'xxxxxxxxxxxx'; // 此处应为腾讯ai控制台中申请的appkey
      // 传入的数据可替换默认
      Object.assign(finalObj, params)
      // 计算sign参数（接口请求签名）
      finalObj.sign = txAPI.getReqSign(finalObj, appkey);
      return finalObj
    } catch (e) {
      console.log(e)
    }
  },
  // 得到所有请求参数
  // var_dump($params);// 输出或返回字符串，此时可以不返回计算的签名参数，直接继续执行API调用
  // 三、执行API调用
  /**
   * doHttpPost ：执行POST请求，并取回响应结果
   * @param path 接口请求地址
   * @param inParams 传入的完整接口请求参数（特别注意：不同的接口，参数对一般不一样，请以具体接口要求为准）
   * 
   * 返回数据
   *  - 返回false表示失败，否则表示API成功返回的HTTP BODY部分
   */
  doHttpPost: async (path, inParams, imgPath) => {
    const outParams = await txAPI.getAllParams(inParams, imgPath)
    return new Promise((resolve, reject) => {
      try {
        let _data = ''
        const opt = {
          host: 'api.ai.qq.com',
          post: '80',
          path: path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        const req = https.request(opt, (res) => {
          res.setEncoding('utf8')
            .on("data", (chunk) => {
              _data += chunk;
            })
            .on('end', function () {
              resolve(_data)
            })
            .on('error', function (e) {
              throw e
            })
        })
        req.end(qs.stringify(outParams))
      } catch (e) {
        reject(e)
      }
    })
  },
  /**
   * handleErrorCode：根据腾讯AI平台返回的错误码，给出对应的提示
   * @param errorCode 错误码 
   */
  handleErrorCode(errorCode) {
    let errmsg = '';
    const codeTable = {
      16402: '图片没有人脸: 请检查图片是否包含人脸',
      16404: '人脸检测失败: 请联系客服反馈问题',
      16432: '输入图片不是身份证',
      16415: '图片为空: 请检查图片是否正常',
      16430: 'OCR照片为空: 请检查待处理图片是否为空',
      16431: 'OCR识别失败: 请尝试更换带有文字的图片',
      16432: '输入图片不是身份证: 请检查图片是否为身份证',
      16439: '检测或者识别失败: 请联系客服反馈问题',
      16440: '未检测到身份证: 请对准边框(避免拍摄时倾角和旋转角过大、摄像头)',
      16441: '请使用第二代身份证件进行扫描',
      16442: '不是身份证正面照片: 请上传身份证正面照片',
      16443: '不是身份证反面照片: 请上传身份证反面照片',
      16444: '证件图片模糊:	请确保证件图片清晰',
      16445: '请避开灯光直射在证件表面'
    }
    if (codeTable[errorCode]) {
      errmsg = codeTable[errorCode]
    }
    return errmsg;
  },
  handleRecognizeType(type) {
    const typeTable = {
      "idcard_front": { path: '/fcgi-bin/ocr/ocr_idcardocr', params: { 'card_type': '0' }, resImg: 'frontimage' },
      "idcard_back": { path: '/fcgi-bin/ocr/ocr_idcardocr', params: { 'card_type': '1' }, resImg: 'backimage' }
    }
    if (typeTable[type]) {
      return typeTable[type]
    }
    return false
  }
}
module.exports = txAPI;

