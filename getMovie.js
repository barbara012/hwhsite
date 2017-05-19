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
    .timeout({
      response: 10000 // Wait 10 seconds for the server to start sending,
    })
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
    .charset('gb2312')
    .end((err, res) => {
      if (err || !res.ok) {
        console.log(article.link)
        console.log('电影：' + article.title +'，出错了')
        return cb2('电影：' + article.title +'，出错了')
      } else {
        var $ = cheerio.load(res.text, {
            decodeEntities: false
        })
        async.waterfall([
          (cb3) => {
            let title = article.title
            // 解析图片，存到本地
            let $content = $('.co_content8')
            let cover = ''
            let withMap = ''
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
                  if (index === 0) {
                    cover = '/movie/' + r[0]
                  } else {
                    withMap = '/movie/' + r[0]
                  }
                }
              })
            }
            // cb3(null, [])
            // 
            let content = $content.html().replace(/<script.*<\/script>/g, '')
            content = content.replace(/<center.*<\/center>/g, '')
            let name = content.match(/<p>\s?(◎译　　名.*|◎片　　名.*)<\/p>/)
            name = name ? name[1].replace(/◎译　　名|◎片　　名/g, '') : article.title
            name = name.replace(/\s/g, '')


            let pushDate = content.match(/<p>(◎年　　代.*)<\/p>/)
            pushDate = pushDate ? pushDate[1].replace('◎年　　代', '') : '和平年代'
            pushDate = pushDate.replace(/\s/g, '')

            let country = content.match(/<p>(◎国　　家.*|◎地　　区.*|◎产　　地.*)<\/p>/)
            country = country ? country[1].replace(/◎国　　家|◎地　　区|◎产　　地/, '') : '火星'
            country = country.replace(/\s/g, '')


            let movieType = content.match(/<p>(◎类　　别.*|◎类　　型.*)<\/p>/)
            movieType =movieType ? movieType[1].replace(/◎类　　别|◎类　　型/, '') : '爱情动作'
            movieType = movieType.replace(/\s/g, '')

            console.log('电影类型')

            let language = content.match(/<p>(◎语　　言.*)<\/p>/)
            language = language ? language[1].replace('◎语　　言', '') : '火星'
            language = language.replace(/\s/g, '')


            let subtitles = content.match(/<p>(◎字　　幕.*)<\/p>/)
            subtitles = subtitles ? subtitles[1].replace('◎字　　幕', '') : '火星'
            subtitles = subtitles.replace(/\s/g, '')


            let release = content.match(/<p>(◎上映日期.*)<\/p>/)
            release = release ? release[1].replace('◎上映日期', '') : '可能是前几天吧'
            release = release.replace(/\s/g, '')


            let duration = content.match(/<p>(◎片　　长.*)<\/p>/)
            duration = duration ? duration[1].replace('◎片　　长', '') : '140分钟'
            duration = duration.replace(/\s/g, '')
            

            let director = content.match(/<p>(◎导　　演.*)<\/p>/)
            director = director ? director[1].replace('◎导　　演', '') : '葫芦娃'
            director = director.replace(/\s/g, '')


            let starring = content.match(/◎主　　演([\s|\S]*)◎简　　介/)
            starring = starring ? starring[1].replace(/<[^>]+>/g, '') : '葫芦娃'
            starring = starring.replace(/\s^[\n\t]/g, '')


            let download = content.match(/<table[\s|\S]+?<\/table>/)
            download = download ? download[0].replace(/<[^>]+>/g, '') : '暂不提供下载'


            // content = content.replace(/IT之家/g, '火星')
            let score = content.match(/◎IMDb评分\s*(\d.?\d?).*users/)
            if (score) {
              score = score[1]
            } else {
              score = 7
            }
            content = content.replace(/<\!--duguPlayList Start-->[\s|\S]*/, '')
            content = content.replace(/[\s|\S]*<\!--Content Start-->/, '')
            let ts = (new Date()).getTime()
            let sourceurl = article.link
            // cb3(null, [])
            MoviesModel.create({
              title,
              content,
              sourceurl,
              starring,
              pushDate,
              subtitles,
              release,
              name,
              cover,
              withMap,
              director,
              duration,
              movieType,
              score,
              download,
              ts
            })
            .then(function (result) {
              console.log('找到电影第' + count + '部')
              return cb3(null, imgs)
            })
            .catch((err) => {
              console.log('0000000000000000000000000000000')
              console.log(err)
              console.log('已存在该部电影')
              console.log('000000000000000000000000')
              return cb3(null, imgs)
            })
          },
          (imgs, cb3) => { // 把图片存到本地库
            if (imgs.length > 0) {
              async.eachSeries(imgs, (item, cb4) => {
                GetImages.go(item, 'movie', cb4)
              }, (res) => {
                return cb3(true)
              })
            } else {
              return cb3(true)
            }
          }
        ], (res) => {
          console.log('完成一部')
          return cb2()
        })
      }
    })
  }
}
