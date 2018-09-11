var http = require('http');

//创建一个http服务
http.createServer(

  function (request, //客户端发来的请求，node.js 帮我们封装成 request 对象
    response //我们利用response,向客户端发送回答
  ) {
    //在控制台显示request对象

    var querystring = require('querystring');
    var http = require('http');

    var data = querystring.stringify({
      grant_type: "client_credentials",
      scope: "openid",
      client_id: "214271a7be5b4d79bffbb583f6d7668c"
    });

    var opt = {
      method: "POST",
      host: "101.132.195.171",
      port: 80,
      path: "/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic MjE0MjcxYTdiZTViNGQ3OWJmZmJiNTgzZjZkNzY2OGM6MjE0MjcxYTdiZTViNGQ3OWJmZmJiNTgzZjZkNzY2OGM="
      }
    };
    //发送一个请求
    var req = http.request(opt, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应头: ${JSON.stringify(res.headers)}`);
        // res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`响应主体: ${chunk}`);
          return response.end(`响应主体: ${chunk}`);
        }).on('end', () => {
          console.log('end');
        });
      }).on('error', (e) => {
        console.log("Got error: " + e.message)
      });
    // console.log('ccc' + data);
    // 写入数据到请求主体
    req.write(data);
    req.end();
    
  }).listen(3000);

console.log('Server start at 3000');