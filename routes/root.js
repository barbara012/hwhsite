const NewsModel = require('../models/news')
const JshuModel = require('../models/jsarticle')
const PostModel = require('../models/posts')
const GetBanner = require('../models/common/getBanner')
const GetHot = require('../models/common/getHot')
const MoviesModel = require('../models/movies')
const CommentModel = require('../models/comments')
const R = require('ramda')
const checkLogin = require('../middlewares/check').checkLogin
const FormateData = require('../filters/index').formateArticle
const express = require('express')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  Promise.all([
    PostModel.getArticles(page, 10),
    PostModel.getCount(),
    MoviesModel.getMovies(1, 3),
    GetHot.get(4),
    GetBanner.get(2)
  ]).then(function (result) {
    const articles = FormateData(result[0])
    const len = articles.length
    let sortByPv = R.descend(R.prop('pv'))
    let hotArticles = FormateData(R.sort(sortByPv)(R.concat(R.concat(result[3][0], result[3][1]), result[3][2])))
    let banner = FormateData(result[4][0].concat(result[4][1], result[4][2]))
    let sortByTs = function (a, b) {
      if (a.ts > b.ts) return -1
      if (a.ts < b.ts) return 1
      if (a.ts === b.ts) return 0
    }
    banner = R.sort(sortByTs)(banner)
    res.render('articles', {
      articles: articles,
      movies: result[2],
      banners: banner,
      hotArticles: hotArticles, // 热门博文
      lastTs: lastTs: len > 0 ? articles[len - 1].ts : 0,
      isFirstPage: page === 1,
      articleType: 'posts',
      originalUrl: req.originalUrl,
      isLastPage: page * 10 >= result[1],
      page: page
    })
  }).catch(next)
})
router.get('/items', (req, res, next) => {
  const type = req.query.type
  const lastTs = req.query.lastTs * 1
  if (typeof lastTs !== 'number' || lastTs <= 0) {
    return res.send({
      status: 'fail',
      mes: 'page必须是正整型'
    })
  }
  let ItemsModel
  if (type === 'news') {
    ItemsModel = NewsModel
  } else if (type === 'posts') {
    ItemsModel = PostModel
  } else if (type === 'articles') {
    ItemsModel = JshuModel
  } else {
    return res.send({
      status: 'fail',
      mes: '请求出错'
    })
  }
  Promise.all([
      ItemsModel.getArticles(1, 10, lastTs),
      ItemsModel.getCount()
    ])
    .then(result => {
      let articles = result[0]
      let len = articles.length
      return res.send({
        status: 'ok',
        articles: articles ? FormateData(articles) : [],
        lastTs: len > 0 ? articles[len - 1].ts: 0,
        total: result[1]
      })
    })
    .catch(next)
})
//app-news
router.get('/app/news', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  Promise.all([
    NewsModel.getArticles(page, 10), 
    NewsModel.getCount()
  ])
  .then(result => {
    let articles = FormateData(result[0])
    res.send({
      articles: articles
    })
  })
  .catch(next)
})
//app-posts
router.get('/app/posts', function (req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  Promise.all([
    PostModel.getArticles(page, 10),
    PostModel.getCount()
  ])
    .then(result => {
      let articles = FormateData(result[0])
      res.send({
        articles: articles
      })
    })
    .catch(next)
})
//app-jShu
router.get('/app/articles', function (req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  Promise.all([
    JshuModel.getArticles(page, 10),
    JshuModel.getCount()
  ])
    .then(result => {
      let articles = FormateData(result[0])
      res.send({
        articles: articles
      })
    })
    .catch(next)
})
module.exports = router
