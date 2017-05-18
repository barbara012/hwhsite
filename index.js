const path = require('path')
const http = require('http')
const https = require('https')
const fs = require('fs')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const favicon = require('serve-favicon')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')
const events = require('events')
const GetNews = require('./getIthome')
const GetJshu = require('./getJianshu')
const GetDy = require('./getDy')
const url = 'http://www.ithome.com'
const jsUrl = 'http://www.jianshu.com'
const dyUrl = 'http://www.dy2018.com'

const app = express()

const options = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt')
}
httpServer = http.createServer(app)
httpsServer = https.createServer(options, app)
events.EventEmitter.prototype._maxListeners = 100

// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 ejs
app.set('view engine', 'ejs')
// 解析json 
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'static'), {
  maxAge: 1000 * 60 * 60 * 24 * 90
}))
app.use(favicon(__dirname + '/static/favicon.png'))
// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,// 强制更新 session
  saveUninitialized: false,// 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}))
// flash 中间价，用来显示通知
app.use(flash())
// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'static/img-db'),// 上传文件目录
  keepExtensions: true// 保留后缀
}))

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name + '没有态度的小站',
  description: pkg.description
}

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 正常请求的日志
// app.use(expressWinston.logger({
//   transports: [
//     new (winston.transports.Console)({
//       json: true,
//       colorize: true
//     }),
//     new winston.transports.File({
//       filename: 'logs/success.log'
//     })
//   ]
// }))
// 路由
routes(app)
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

// error page
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  })
})

if (module.parent) {
  module.exports = app
} else {
  // 监听端口，启动程序
  httpServer.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
  // httpsServer.listen(4001, function () {
  //   console.log(`${pkg.name} listening on port 4001`)
  // })
  GetNews.go(url)
  GetJshu.go(jsUrl)
  GetDy.go(dyUrl)
}
