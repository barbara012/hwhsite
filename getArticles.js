const http = require("http")
const fs = require("fs")
const cheerio = require("cheerio")
const path = require('path')
const superAgent = require('superagent')
const GetImages = require('./getImages')
const async = require('async')
const NewModel = require('./models/news')
// var urlList = JSON.parse(fs.readFileSync('list.json', 'utf8'))
module.exports = {
  go (article, count, cb2) {
    superAgent
    .get(article.link)
    .set('Connection', 'keep-alive')
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
    .end((err, res) => {
      if (err || !res.ok) {
         console.log('文章：' + article.title +'，出错了')
         cb2(false)
         return
      } else {
        var $ = cheerio.load(res.text, {
            decodeEntities: false
        })
        async.waterfall([
          (cb3) => {
            let title = $('.post_title h1').text()
            if (!title) {
              cb3(false, [])
              return
            }
            // 解析图片，存到本地
            let $new = $('#paragraph')
            let $img = $new.find('img')
            let imgs = []
            if ($img) {
              $img.each((index, img) => {
                let imgUrl = $(img).attr('data-original')
                let r = imgUrl.match(/(http:\/\/)?\w+\.(jpg|jpeg|gif|png)/) // 提取图片名
                if (r && r.length > 0) {
                  imgs.push({
                    name: r[0],
                    url: imgUrl
                  })
                  $(img).attr('src', '/news/' + r[0]) //替换成本地路径
                }
              })
            }
            // 
            let content = $new.html().replace(/<script.*<\/script>/g, '')
            let pdate = $('#pubtime_baidu').text()
            let ts = (new Date(pdate)).getTime()
            let tag = $('.hot_tags').text().substr(4)
            let author = $('#author_baidu strong').text()
            let sourceurl = article.link
            NewModel.create({
              title,
              content,
              sourceurl,
              ts,
              tag,
              pdate,
              author
            })
            .then(function (result) {
              console.log('薅完第' + count + '篇')
              cb3(false, imgs)
            })
            .catch((err) => {
              console.log('已存在该篇文章')
              cb3(false, [])
            })
          },
          (imgs, cb3) => { // 把图片存到本地库
            if (imgs.length > 0) {
              async.eachSeries(imgs, (item, cb4) => {
                GetImages.go(item, cb4)
              }, (res) => {
                console.log('完成一篇')
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
