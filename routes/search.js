const express = require('express')
const router = express.Router()
const NewsModel = require('../models/news')
const PostModel = require('../models/posts')
const JshuModel = require('../models/jsarticle')
const FormateNews = require('../filters/index').formateNews

// var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/', function(req, res, next) {
  // 清空 session 中用户信息
  let keyword = req.query.keyword
  NewsModel.getByKeyWords(keyword)
    .then(result => {
      let news = FormateNews(result)
      res.render('search', {
        articleType: 'search',
        articles: news,
        originalUrl: req.originalUrl,
      })
    })
    .catch(next)
});

module.exports = router;