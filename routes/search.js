const express = require('express')
const R = require('ramda')
const router = express.Router()
const NewsModel = require('../models/news')
const PostModel = require('../models/posts')
const JshuModel = require('../models/jsarticle')
const FormateArticle = require('../filters/index').formateArticle
const HightLight = require('../filters/index').highLight

// var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/', function(req, res, next) {
  // 清空 session 中用户信息
  let keyword = req.query.keyword
  Promise.all([
    PostModel.getByKeyWords(keyword),
    JshuModel.getByKeyWords(keyword),
    NewsModel.getByKeyWords(keyword)
  ])
  .then(result => {
    let news = FormateArticle(result[2])
    let jShu = FormateArticle(result[1])
    let post = FormateArticle(result[0])
    let articles= R.concat(R.concat(news, jShu), post)
    articles = HightLight(articles, keyword)
    let byCreatedAt = R.descend(R.prop('pv'))
    articles = R.sort(byCreatedAt)(articles)
    res.render('search', {
      articleType: 'search',
      articles: articles,
      originalUrl: req.originalUrl,
    })
  })
  .catch(next)
});

module.exports = router;