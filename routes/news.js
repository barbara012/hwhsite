const NewsModel = require('../models/news')
const JshuModel = require('../models/jsarticle')
const PostModel = require('../models/posts')
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
  let pCount = NewsModel.getCount()
  let pNews = NewsModel.getNews(page, 10)
  let pMovies = MoviesModel.getMovies(1, 3)
  let newHot = NewsModel.getHot()
  let articleHot = JshuModel.getHot()
  let postHot = PostModel.getHot()
  let bannerNew = NewsModel.getBanner()
  let bannerArticle = JshuModel.getBanner()
  let bannerPost = PostModel.getBanner()
  Promise.all([pCount, pNews, pMovies, newHot, articleHot, postHot, bannerNew, bannerArticle, bannerPost])
  .then(function (result) {
    const articles = FormateData(result[1])
    let banner = R.concat(R.concat(result[6], result[7]), result[8]) //FormateData(result[6])
    banner = FormateData(banner)
    let newH = FormateData(result[3])
    let articleH = FormateData(result[4])
    let postH = FormateData(result[5])
    let sortByPv = R.descend(R.prop('pv'))
    let hotArticles = R.sort(sortByPv)(R.concat(R.concat(newH, articleH), postH))
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
router.get('/:newId', function(req, res, next) {
  const newId = req.params.newId
  Promise.all([
    NewsModel.getOne(newId),
    CommentModel.getComments(newId),
    NewsModel.incPv(newId),
  ])
  .then(result => {
    let article = result[0]
    article.tag = article.tag ? article.tag.split(/，|\/|,|\\|-|&|\||@|·/) : []
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
//编辑banner
router.get('/banner/:articleId/edit', checkLogin, (req, res, next) => {
  let articleId = req.params.articleId
  NewsModel.getOne(articleId)
    .then(article => {
      res.render('edit', {
        article: article,
        active: 'banner'
      })
    })
    .catch(next)
})
router.post('/banner/:articleId/edit', checkLogin, (req, res, next) => {
  let articleId = req.params.articleId
  const title = req.fields.title
  const content = req.fields.content
  const tag = req.fields.tag || '原创'
  const mark = 'banner'
  // 校验参数
  try {
    if (!title.length) {
        throw new Error('请填写标题')
    }
    if (!content.length) {
        throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.send({
      status: 'fail',
      mes: e.message
    })
  }
  NewsModel.updateOne(articleId, {
      title,
      content,
      tag,
      mark
    })
    .then(result => {
      return res.send({
        status: 'ok',
        mes: '修改成功',
        url: '/admin/banner'
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
router.post('/:newId/remove', checkLogin, function(req, res, next) {
  const newId = req.params.newId
  if (req.session.user.privilege === 1) {
    NewsModel.removeOne(newId)
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
