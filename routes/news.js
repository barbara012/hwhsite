const NewsModel = require('../models/news')
const MoviesModel = require('../models/movies')
const CommentModel = require('../models/comments')
const checkLogin = require('../middlewares/check').checkLogin
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
      originalUrl: req.originalUrl,
      isLastPage: page * 10 >= result[0],
      page: page
    })
  }).catch(next)
})
router.get('/:newId', function(req, res, next) {
  const newId = req.params.newId
  Promise.all([
    NewsModel.getOne(newId),
    CommentModel.getComments(newId),
    NewsModel.incPv(newId)
  ])
  .then(result => {
    let article = result[0]
    article.tag = article.tag ? article.tag.split('，') : []
    article.pv = article.pv || 0
    res.render('article', {
      article: article,
      comments: result[1], 
      originalUrl: req.originalUrl,
      articleType: 'news',
      disclaimer: '内容均来自网络，侵删'
    })
  })
  .catch(next)
})
// 创建一条留言
router.post('/:articleId/comment', checkLogin, function(req, res, next) {
  let author = req.session.user._id
  let articleId = req.params.articleId
  let content = req.fields.content
  let comment = {
    author: author,
    articleId: articleId,
    content: content
  }

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', '留言成功')
      // 留言成功后跳转到上一页
      res.send({
        status: 'ok',
        mes: '留言成功'
      })
    })
    .catch(next)
})
//删除一条留言
router.post('/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var commentId = req.params.commentId
  var author = req.session.user._id

  CommentModel.delCommentById(commentId, author)
    .then(function (result) {
      if (result.result.n === 1 && result.result.ok === 1) {
        req.flash('success', '删除留言成功')
        // 删除成功后跳转到上一页
        res.send({
          status: 'ok',
          mes: '删除留言成功'
        })
      } else {
        req.flash('error', '系统错误')
        res.send({
          status: 'fail',
          mes: 'oops！出错啦'
        })
      }
    })
    .catch(next)
})
router.post('/:newId/remove', function(req, res, next) {
  if (req.session.user && req.session.user.name == 'huwenhua') {
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
