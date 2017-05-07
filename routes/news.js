const NewsModel = require('../models/news')
const express = require('express')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  let pCount = NewsModel.getCount()
  let pNews = NewsModel.getNews(page)
  Promise.all([pCount, pNews]).then(function (result) {
    let articles = result[1].map((article) => {
      let r = article.content.match(/<img.+?>/)
      let p = article.content.match(/<p.+?p>/)
      if (p) {
        p[0].replace(/<img.+?>/g, '')
      }
      article.img = r ? r[0] : ''
      article.content = p ? p[0] : ''
      article.tag = article.tag.split('，')
      return article
    })
    res.render('articles', {
      articles: articles,
      isFirstPage: page === 1,
      articleType: 'news',
      isLastPage: page * 10 >= result[0],
      page: page
    })
  }).catch(next)
})
router.get('/:newId', function(req, res, next) {
  const newId = req.params.newId
  NewsModel.getOne(newId)
    .then(function (article) {
      article.tag = article.tag.split('，')
      res.render('article', {
        article: article,
        articleType: 'articles',
        disclaimer: '内容均来自网络，侵删'
      })
    })
    .catch(next)
})
module.exports = router
