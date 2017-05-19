const http = require("http")
const fs = require("fs")
const cheerio = require("cheerio")
const path = require('path')
const superAgent = require('superagent')
const GetImages = require('./getImages')
const async = require('async')
const JshuModel = require('./models/jsarticle')
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
         console.log('简书文章：' + article.title +'，出错了')
         cb2(false)
         return
      } else {
        var $ = cheerio.load(res.text, {
            decodeEntities: false
        })
        async.waterfall([
          (cb3) => {
            let $article = $('.article')
            let title = $article.find('.title').text()
            // 解析图片，存到本地
            let $content = $article.find('.show-content')
            let $img = $content.find('.image-package img')
            let imgs = []
            if ($img) {
              $img.each((index, img) => {
                let imgUrl = $(img).attr('data-original-src') || $(img).attr('src')
                if (!imgUrl) return
                  imgUrl = imgUrl.replace('http:', '')
                let r = imgUrl.match(/(http:\/\/)?\w+\.(jpg|jpeg|gif|png)/) // 提取图片名
                if (r && r.length > 0) {
                  imgs.push({
                    name: r[0],
                    url: `http:${imgUrl}`
                  })
                  $(img).attr('src', '/jsimg/' + r[0]) //替换成本地路径
                }
              })
            }
            // 
            let content = $content.html().replace(/<script.*<\/script>/g, '')
            let pdate = $article.find('.author .publish-time').text().replace(/\*/g, '')
            let ts = (new Date(pdate)).getTime()
            let tag = article.tag
            let author = $article.find('.author .name').text()
            let sourceurl = article.link
            JshuModel.create({
              title,
              content,
              sourceurl,
              ts,
              tag,
              pdate,
              author
            })
            .then(function (result) {
              console.log('简书薅完第' + count + '篇')
              cb3(false, imgs)
            })
            .catch((err) => {
              console.log('简书已存在该篇文章')
              cb3(false, imgs)
            })
          },
          (imgs, cb3) => { // 把图片存到本地库
            if (imgs.length > 0) {
              async.eachSeries(imgs, (item, cb4) => {
                GetImages.go(item, 'jsimg', cb4)
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
