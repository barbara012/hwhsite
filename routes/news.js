const NewsModel = require('../models/news')
const express = require('express')
var asset = require('../asset.json')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  let pCount = NewsModel.getCount()
  let pNews = NewsModel.getNews(page)
  Promise.all([pCount, pNews]).then(function (result) {
    let news = result[1].map((item) => {
      let r = item.content.match(/<img.+?>/)
      let p = item.content.match(/<p.+?p>/)
      if (p) {
        p[0].replace(/<img.+?>/g, '')
      }
      item.img = r ? r[0] : ''
      item.content = p ? p[0] : ''
      item.tag = item.tag.split('，')
      return item
    })
    res.render('news', {
      articles: news,
      isFirstPage: page === 1,
      isLastPage: page * 10 >= result[0],
      page: page,
      stats: asset.index
    })
  }).catch(next)
})
router.get('/:newId', function(req, res, next) {
  const newId = req.params.newId
  NewsModel.getOne(newId)
    .then(function (article) {
      res.render('new', {
        article: article,
        stats: asset.index
      })
    })
    .catch(next)
})
module.exports = router
