const http = require("http")
const fs = require("fs")
const cheerio = require("cheerio")
const iconv = require("iconv-lite")
const path = require('path')
const superAgent = require('superagent')
const async = require('async')
let count = 0
module.exports = {
  go: function getImg(img, file, cb4) {
    superAgent
    .get(img.url)
    .set('Content-Type', 'multipart/form-data')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
    .end((err, res) => {
      count++
      if (err || !res.ok) {
        console.log(img.url)
        console.log('出错了')
        if (file === 'movie' && count < 4) {
          getImg(img, file, cb4)
        } else {
          cb4()
        }
      } else {
        fs.writeFile(`${__dirname}/static/${file}/${img.name}`, res.body, "binary", (err) => {
          console.log('获取了一张图，好图')
          cb4()
        })
      }
    })
  }
}
