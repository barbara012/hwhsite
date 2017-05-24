const JshuModel = require('../models/jsarticle')
const MoviesModel = require('../models/movies')
const CommentModel = require('../models/comments')
const FormateArticles = require('../filters/index').formateArticle
const checkLogin = require('../middlewares/check').checkLogin
const express = require('express')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  let pCount = JshuModel.getCount()
  let pArticles = JshuModel.getArticles(page)
  let pMovies = MoviesModel.getMovies(1, 3)
  Promise.all([pCount, pArticles, pMovies]).then(result => {
    // console.log(result)
    let articles = FormateArticles(result[1])
    res.render('articles', {
      articles: articles,
      movies: result[2],
      isFirstPage: page === 1,
      articleType: 'articles',
      originalUrl: req.originalUrl,
      isLastPage: page * 10 >= result[0],
      page: page
    })
  }).catch(next)
})
router.get('/:articleId', function(req, res, next) {
  const articleId = req.params.articleId
  Promise.all([
    JshuModel.getOne(articleId),
    CommentModel.getComments(articleId),
    JshuModel.incPv(articleId)
  ])
  .then(result => {
    let article = result[0]
    article.tag = article.tag ? article.tag.replace(/@/g, '').split(/，|\/|,|\\|-|&|\||@|·/) : []
    article.pv = article.pv || 0
    res.render('article', {
      article: article,
      comments: result[1],
      originalUrl: req.originalUrl,
      articleType: 'articles',
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
router.post('/:articleId/remove', checkLogin, function(req, res, next) {
  const articleId = req.params.articleId
  if (req.session.user && req.session.user.privilege === 1) {
    JshuModel.removeOne(articleId)
      .then(function (result) {
        if (result) {
          res.send({
            ok: 1,
            mes: '删除成功' 
          })
        } else {
          res.send({
            ok: 0,
            mes: '未找到' 
          })
        }
      })
      .catch(next)
  } else {
    res.send({
      ok: 0,
      mes: '日你大呗，你没权限' 
    })
  }
})
module.exports = router
