const NewsModel = require('../models/news')
const MoviesModel = require('../models/movies')
const express = require('express')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  let pCount = NewsModel.getCount()
  let pNews = NewsModel.getNews(page)
  let pMovies = MoviesModel.getMovies(1, 3)
  Promise.all([pCount, pNews, pMovies]).then(function (result) {
    let articles = result[1].map((article) => {
      let r = article.content.match(/<img.+?>/)
      let rendNumber = Math.random() * (200 - 150 + 1) + 150
      let p = article.content.replace(/<[^>]+>/g, '')
      article.img = r ? r[0] : ''
      article.content = p.substr(0, rendNumber) + '...'
      article.tag = article.tag.split('，')
      article.pv = article.pv || 0
      return article
    })
    res.render('articles', {
      articles: articles,
      movies: result[2],
      isFirstPage: page === 1,
      articleType: 'news',
      isLastPage: page * 10 >= result[0],
      page: page
    })
  }).catch(next)
})
router.get('/:newId', function(req, res, next) {
  const newId = req.params.newId
  Promise.all([
    NewsModel.getOne(newId),
    NewsModel.incPv(newId)
  ])
  .then(result => {
    let article = result[0]
    article.tag = article.tag ? article.tag.split('，') : []
    article.pv = article.pv || 0
    res.render('article', {
      article: article,
      articleType: 'news',
      disclaimer: '内容均来自网络，侵删'
    })
  })
  .catch(next)
})
router.post('/delete/:newId', function(req, res, next) {
  if (req.session.user && req.session.user.name == '胡文华') {
    const newId = req.params.newId
    NewsModel.removeOne(newId)
      .then(function (result) {
        res.send(result.result)
      })
      .catch(next)
  } else {
    res.send({
      n: '没有权限',
      ok: false
    })
  }
})
module.exports = router
