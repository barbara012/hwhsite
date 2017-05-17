const http = require('http')
const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const GetMovie = require('./getMovie')
const GetMovie2 = require('./getMovie2')
const superAgent = require('superagent')
const superCharset = require('superagent-charset')
const schedule = require("node-schedule")
const async = require('async')
const rule = new schedule.RecurrenceRule()
superCharset(superAgent)
rule.minute = 55
const indexUrl = 'http://www.dytt8.net/index.htm'
const dtUrl = 'http://www.dytt8.net'
module.exports = {
  go: (url) => {
    let task = schedule.scheduleJob(rule, function(){
      async.waterfall([
        (cb) => {
          superAgent
            .get(indexUrl)
            .set('Connection', 'keep-alive')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=gb2312')
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
            .charset('gb2312')
            .end(function(err, res){
              if (err || !res.ok) {
                  // console.log(err)
                  console.log('Oh no! error')
                  cb(false, 'done')
              } else {
                  let html = res.text
                  let $ = cheerio.load(html, {
                      decodeEntities: false
                  })
                  let links = []
                  let content = Array.from($('.co_area2'))
                  content = content[1]
                  $(content).find('tr').each(function(i, elem) {
                    let a = Array.from($(this).find('a'))
                    a = a[1]
                    let link = {}
                    link.title = $(a).text()
                    link.link = dtUrl + $(a).attr('href')
                    links.unshift(link)
                  })
                  let count = 0
                  console.log(links)
                  async.eachSeries(links, (item, callback) => {
                    GetMovie2.go(item, count++, callback)
                  }, () => {
                    cb(false, 'done')
                  })
                }
              })
        },
        (res, cb) => {
          superAgent
            .get(url)
            .set('Connection', 'keep-alive')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=gb2312')
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
            .charset('gb2312')
            .end(function(err, res){
              if (err || !res.ok) {
                console.log('Oh no! error')
                cb(false, 'done')
              } else {
                  let html = res.text
                  let $ = cheerio.load(html, {
                      decodeEntities: false
                  })
                  let links = []
                  let content = Array.from($('.co_content222'))
                  content = content[0]
                  $(content).find('a').each(function(i, elem) {
                    let link = {}
                    link.title = $(this).text()
                    link.link = url + $(this).attr('href')
                    links.unshift(link)
                  })
                  let count = 0
                  console.log(links)
                  async.eachSeries(links, (item, callback) => {
                    GetMovie.go(item, count++, callback)
                  }, () => {
                    cb(true, 'done')
                  })
                }
              })
        },
      ], (res) => {
        console.log('完美！')
        console.log('scheduleRecurrenceRule:' + new Date())
      })
    })
  }
}
