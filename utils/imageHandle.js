const fs = require('fs');
  
exports.uploadFile = (files, req, postData) => {
  const boundaryKey = Math.random().toString(16);
  const endData = '\r\n----' + boundaryKey + '--';
  let filesLength = 0, content;
  // 初始数据，把post过来的数据都携带上去
  content = ((obj) => {
    let rslt = [];
    Object.keys(obj).forEach((key) => {
      arr = ['\r\n----' + boundaryKey + '\r\n'];
      arr.push('Content-Disposition: form-data; name="' + obj[key][0] + '"\r\n\r\n');
      arr.push(obj[key][1]);
      rslt.push(arr.join(''));
    });
    return rslt.join('');
  })(postData);
  // 组装数据
  Object.keys(files).forEach((key) => {
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
  const allFiles = Object.keys(files);
  const fileNum = allFiles.length;
  let uploadedCount = 0;
  allFiles.forEach((key) => {
    req.write(files[key].contentBinary);
    // console.log("files[key].path:" + files[key][1].path);
    const fileStream = fs.createReadStream(files[key][1].path, { bufferSize: 4 * 1024 });
    fileStream.on('end', () => {
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