const http = require('http')
const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const GetArticle = require('./getJArticles')
const superAgent = require('superagent')
const schedule = require("node-schedule")
const async = require('async')
const rule = new schedule.RecurrenceRule()
const url = 'http://www.jianshu.com'
rule.minute = 50
module.exports = {
  go: () => {
    let task = schedule.scheduleJob(rule, function(){
      console.log('scheduleRecurrenceRule:' + new Date())
      async.waterfall([
        (cb) => {
          superAgent
            .get(url)
            .set('Connection', 'keep-alive')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36')
            .end(function(err, res){
               if (err || !res.ok) {
                 console.log('Oh no! error')
                 return cb('Oh no! error')
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
                   GetArticle.go(item, count++, callback)
                 }, () => {
                   return cb('完美')
                 })
               }
             })
        }
      ], (res) => {
        console.log(res)
        console.log('scheduleRecurrenceRule:' + new Date())
      })
    })
  }
}

