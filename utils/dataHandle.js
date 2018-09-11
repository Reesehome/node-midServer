var fs = require('fs')

/**
* base64编码和解码
*/
exports.base64_encode = (file) => {
  var bitmap = fs.readFileSync(file);
  var buffer = new Buffer(bitmap)
  return buffer.toString('base64');
},
exports.base64_decode = (base64Str, file) => {
  var bitmap = new Buffer(base64Str, 'base64')
  fs.writeFileSync(file, bitmap)
},
/**
 * sortParams: 将传入的对象按照key升序规则排序
 */
exports.sortParams = (obj) => {
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
 */
exports.getRandomStr = (len) => {
  var charArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  var charArrLen = charArr.length - 1
  var str = ''
  var randomIndex = ''
  for (var i = 0; i < len; i++) {
    randomIndex = parseInt(Math.random() * charArrLen)
    str += charArr[randomIndex]
  }
  return str
}