var path = require('path') 

// 通过NODE_ENV来设置环境变量，如果没有指定则默认为生产环境
var env = process.env.NODE_ENV || 'prod';
env = env.toLowerCase();

// 载入配置文件
var file = path.resolve(__dirname, `../config/${env}.env`);
try {
  var config = module.exports = require(file);
} catch (err) {
  console.error('Cannot load config: [%s] %s', env, file);
  throw err;
}