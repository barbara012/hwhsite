const NewsModel = require('../models/news')
const express = require('express')
var asset = require('../asset.json')
const router = express.Router()
router.get('/', function(req, res, next) {
  const author = req.query.author
  NewsModel.getNews()
    .then(function (news) {
      res.render('news', {
        articles: news,
        stats: asset.index
      })
    })
    .catch(next)
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
