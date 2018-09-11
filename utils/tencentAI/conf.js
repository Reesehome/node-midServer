// 通过 setAppInfo 设置
exports.APPID = '';
exports.APPKEY = '';

exports.API_TXAI_SERVER = 'api.ai.qq.com'
exports.API_TXAI_PORT = 80;

// 初始化 应用信息
exports.setAppInfo = function(app_id, appkey) {
  module.exports.APPID = app_id;
  module.exports.APPKEY = appkey;
}