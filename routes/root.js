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
    NewsModel.getCount(),
    NewsModel.getNews(page, 10), 
    MoviesModel.getMovies(1, 3),
    GetHot.get(4),
    GetBanner.get(2)
  ]).then(function (result) {
    const articles = FormateData(result[1])
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
      isFirstPage: page === 1,
      articleType: 'news',
      originalUrl: req.originalUrl,
      isLastPage: page * 10 >= result[0],
      page: page
    })
  }).catch(next)
})
//app
router.get('/app', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  Promise.all([
    NewsModel.getCount(),
    NewsModel.getNews(page, 10), 
    MoviesModel.getMovies(1, 3),
    GetHot.get(4),
    GetBanner.get(2)
  ])
  .then(result => {
    let articles = FormateData(result[1])
    let banner = FormateData(result[4][0].concat(result[4][1], result[4][2]))
    let sortByTs = function (a, b) {
      if (a.ts > b.ts) return -1
      if (a.ts < b.ts) return 1
      if (a.ts === b.ts) return 0
    }
    banner = R.sort(sortByTs)(banner)
    let sortByPv = R.descend(R.prop('pv'))
    let hotArticles = FormateData(R.sort(sortByPv)(R.concat(R.concat(result[3][0], result[3][1]), result[3][2])))
    res.send({
      articles: articles
    })
  })
  .catch(next)
})
module.exports = router
