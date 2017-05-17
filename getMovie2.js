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
         cb2(false, 'done')
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
            console.log(imgs)
            // cb3(null, [])
            // return
            // 
            let content = $content.html().replace(/<script.*<\/script>/g, '')
            content = content.replace(/<center.*<\/center>/g, '')
            let name = content.match(/<br>\s?(◎译　　名.[^<br>]*|◎片　　名.[^<br>]*)<br>/)
            name = name ? name[1].replace(/◎译　　名|◎片　　名/g, '') : article.title
            name = name.replace(/\s/g, '')


            let pushDate = content.match(/<br>(◎年　　代.[^<br>]*)<br>/)
            pushDate = pushDate ? pushDate[1].replace('◎年　　代', '') : '和平年代'
            pushDate = pushDate.replace(/\s/g, '')

            let country = content.match(/<br>(◎国　　家.[^<br>]*|◎地　　区.[^<br>]*|◎产　　地.[^<br>]*)<br>/)
            country = country ? country[1].replace(/◎国　　家|◎地　　区|◎产　　地/, '') : '火星'
            country = country.replace(/\s/g, '')


            let movieType = content.match(/<br>(◎类　　别.[^<br>]*|◎类　　型.[^<br>]*)<br>/)
            movieType = movieType ? movieType[1].replace(/◎类　　别|◎类　　型/, '') : '爱情动作片'
            movieType = movieType.replace(/\s/g, '')


            let language = content.match(/<br>(◎语　　言.[^<br>]*)<br>/)
            language = language ? language[1].replace('◎语　　言', '') : '火星'
            language = language.replace(/\s/g, '')


            let subtitles = content.match(/<br>(◎字　　幕.[^<br>]*)<br>/)
            subtitles = subtitles ? subtitles[1].replace('◎字　　幕', '') : '火星语'
            subtitles = subtitles.replace(/\s/g, '')


            let release = content.match(/<br>(◎上映日期.[^<br>]*)<br>/)
            release = release ? release[1].replace('◎上映日期', '') : '不清楚'
            release = release.replace(/\s/g, '')


            let duration = content.match(/<br>(◎片　　长.[^<br>]*)<br>/)
            duration = duration ? duration[1].replace('◎片　　长', '') : '130分钟'
            duration = duration.replace(/\s/g, '')
            

            let director = content.match(/<br>(◎导　　演.[^<br>]*)<br>/)
            director = director ? director[1].replace('◎导　　演', '') : '匿名'
            director = director.replace(/\s/g, '')


            let starring = content.match(/◎主　　演([\s|\S]*)◎简　　介/)
            starring = starring ? starring[1].replace(/<[^>]+>/g, '') : '葫芦娃'
            starring = starring.replace(/\s^[\n\t]/g, '')


            let download = content.match(/<table[\s|\S]+?<\/table>/)
            download = download ? download[0].replace(/<[^>]+>/g, '') : '暂不提供下载'


            // content = content.replace(/IT之家/g, '火星')
            let score = content.match(/◎IMDb评分.[^\d]*(\d.?\d?).*user/)
            if (score) {
              score = score[1]
            } else {
              score = 0
            }
            content = content.replace(/[\s|\S]*<\!--Content Start-->/, '')
            content = content.replace(/【下载地址】[\s|\S]*/, '</p>')
            content = content.replace(/<span style="FONT-SIZE: 12px"><td>/, '')
            let ts = (new Date()).getTime()
            // let tag = $('.hot_tags').text().substr(4)
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
              cb3(false, imgs)
            })
            .catch((err) => {
              console.log('0000000000000000000000000000000')
              console.log('已存在该部电影')
              console.log('000000000000000000000000')
              cb3(false, [])
            })
          },
          (imgs, cb3) => { // 把图片存到本地库
            // cb3(null)
            if (imgs.length > 0) {
              async.eachSeries(imgs, (item, cb4) => {
                GetImages.go(item, 'movie', cb4)
              }, (res) => {
                console.log('完成一部')
                cb3(true, 'done')
              })
            } else {
              cb3(true, 'done')
            }
          }
        ], (res) => {
          cb2()
        })
      }
    })
  }
}
