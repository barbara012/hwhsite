const http = require('http')
const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const GetArticle = require('./getArticles')
const GetJArticle = require('./getJArticles')
const GetMovie = require('./getMovie')
const superAgent = require('superagent')
const superCharset = require('superagent-charset')
const async = require('async')
superCharset(superAgent)
const url = 'http://www.jianshu.com'
const dyUrl = 'http://www.dy2018.com'
async.waterfall([
    (cb) => {
      superAgent
        .get('http://www.ithome.com/')
        .set('Connection', 'keep-alive')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
        .end(function(err, res){
           if (err || !res.ok) {
             console.log('Oh no! error')
             cb(false)
           } else {
             var $ = cheerio.load(res.text);
             let links = []
             $('.new-list li a').each(function(i, elem) {
               let link = {}
               link.title = $(this).text()
               link.link = $(this).attr('href')
               links.unshift(link)
             })
             let count = 0
             async.eachSeries(links, (item, callback) => {
               GetArticle.go(item, count++, callback)
             }, () => {
               cb(null, 'done')
             })
           }
         })
    },
    (res, cb) => {
      superAgent
        .get(url)
        .set('Connection', 'keep-alive')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
        .end(function(err, res){
           if (err || !res.ok) {
             console.log('Oh no! error')
             cb(false)
           } else {
            var $ = cheerio.load(res.text);
             let links = []
             $('.note-list li').each(function(i, elem) {
              let $a = $(this).find('.title')
               let link = {}
               link.title = $a.text()
               link.tag = $(this).find('.collection-tag').text()
               link.link = url + $a.attr('href')
               links.unshift(link)
             })
             let count = 0
             async.eachSeries(links, (item, callback) => {
               GetJArticle.go(item, count++, callback)
             }, () => {
               cb(false, 'done')
             })
           }
         })
    },
    (res, cb) => {
      superAgent
        .get(dyUrl)
        .set('Connection', 'keep-alive')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
        .charset('gb2312')
        .end(function(err, res){
          if (err || !res.ok) {
            console.log(err)
              console.log('Oh no! error')
              cb(false)
          } else {
              let html = res.text //iconv.decode(new Buffer(res.text, 'binary'), 'gb2312')
              let $ = cheerio.load(html);
              let links = []
              let content = Array.from($('.co_content222'))
              content = content[0]
              $(content).find('a').each(function(i, elem) {
                // let a = Array.from($(this).find('a'))
                // a = a[1]
                let link = {}
                link.title = $(this).text()
                link.link = dyUrl + $(this).attr('href')
                links.unshift(link)
              })
              let count = 0
              console.log(links)
              async.eachSeries(links, (item, callback) => {
                GetMovie.go(item, count++, callback)
              }, () => {
                cb(false, 'done')
              })
            }
          })
    }
  ], (res) => {
    console.log('完美！')
    console.log('scheduleRecurrenceRule:' + new Date())
    process.exit()
})