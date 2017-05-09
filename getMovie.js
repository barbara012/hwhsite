const http = require("http")
const fs = require("fs")
const cheerio = require("cheerio")
const path = require('path')
const superAgent = require('superagent')
const superCharset = require('superagent-charset')
const GetImages = require('./getImages')
const async = require('async')
superCharset(superAgent)
const MoviesModel = require('./models/movies')
// var urlList = JSON.parse(fs.readFileSync('list.json', 'utf8'))
module.exports = {
  go (article, count, cb2) {
    superAgent
    .get(article.link)
    .set('Connection', 'keep-alive')
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
    .charset('gb2312')
    .end((err, res) => {
      if (err || !res.ok) {
        console.log(article.link)
         console.log('电影：' + article.title +'，出错了')
         cb2(false)
         return
      } else {
        var $ = cheerio.load(res.text, {
            decodeEntities: false
        })
        async.waterfall([
          (cb3) => {
            let title = article.title
            // 解析图片，存到本地
            let $content = $('.co_content8')
            console.log('==================')
            console.log($content)
            console.log('==================')
            let $img = $content.find('img')
            let imgs = []
            if ($img) {
              $img.each((index, img) => {
                let imgUrl = $(img).attr('src')
                let r = imgUrl.match(/(http:\/\/)?\w+\.(jpg|jpeg|gif|png)/) // 提取图片名
                if (r && r.length > 0) {
                  imgs.push({
                    name: r[0],
                    url: imgUrl
                  })
                  $(img).attr('src', '/movie/' + r[0]) //替换成本地路径
                }
              })
            }
            console.log('----------------------')
            console.log(imgs)
            console.log('----------------------')
            // cb3(null, [])
            // 
            let content = $content.html().replace(/<script.*<\/script>/g, '')
            content = content.replace(/<center.*<\/center>/g, '')
            // content = content.replace(/IT之家/g, '火星')
            let score = content.match(/◎IMDb评分\s*(\d.?\d?).*users/)
            if (score) {
              score = score[1]
            }
            let pdate = $('#pubtime_baidu').text()
            let cover = imgs[0].url
            let ts = (new Date()).getTime()
            // let tag = $('.hot_tags').text().substr(4)
            let sourceurl = article.link
            MoviesModel.create({
              title,
              content,
              sourceurl,
              cover,
              score,
              ts,
              // tag,
              pdate
              // author
            })
            .then(function (result) {
              console.log('找到电影第' + count + '篇')
              cb3(false, imgs)
            })
            .catch((err) => {
              console.log('0000000000000000000000000000000')
              console.log(err)
              console.log('已存在该部电影')
              console.log('000000000000000000000000')
              cb3(false, [])
            })
          },
          (imgs, cb3) => { // 把图片存到本地库
            cb3(null)
            if (imgs.length > 0) {
              async.eachSeries(imgs, (item, cb4) => {
                GetImages.go(item, 'movie', cb4)
              }, (res) => {
                console.log('完成一部')
                cb3()
              })
            } else {
              cb3()
            }
          }
        ], (res) => {
          cb2()
        })
      }
    })
  }
}
