const crypto = require('crypto');
const conf = require('./conf');
const dataHandle = require('../dataHandle')
 
const app_id = '10000000' // #gitignore
const appkey = 'xxxxxxxxxxx' // #gitignore
conf.setAppInfo(app_id, appkey)

/**
 * getReqSign ：根据 接口请求参数 计算请求签名
 * @param params 接口请求参数
 */
const getReqSign = (params) => {
  params = dataHandle.sortParams(params);
  let str = '';
  for (const key in params) {
    if (params[key] !== '') {
      str += `${key}=${encodeURIComponent(params[key])}&` // 此处必须要将/,=等字符编码，否则无法获取正确的sign
    }
  }
  str += 'app_key=' + conf.APPKEY;
  // 4. MD5运算+转换大写，得到请求签名
  const sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  return sign;
};

/**
 * getAllParams: 计算sign
 * @param params 传入请求的数据
 * @param imgPath 图片路径（绝对路径）
*/
exports.getAllParams = async (params, imgPath) => {
  try {
    // 异步获取各参数值，提高效率
    const [image, nonce_str, time_stamp] = await Promise.all([
      dataHandle.base64_encode(imgPath), // 图片base64编码
      dataHandle.getRandomStr(32), // 获取随机数
      parseInt(Date.now() / 1000) // 获取当前时间戳
    ])
    // 默认数据
    const finalObj = {
      sign: '',
      app_id: conf.APPID,
      nonce_str,
      image,
      time_stamp
    }
    // 传入的数据可替换默认
    Object.assign(finalObj, params);
    // 计算sign参数（接口请求签名）
    finalObj.sign = getReqSign(finalObj);
    return finalObj
  } catch (e) {
    console.log(e);
  }
}

