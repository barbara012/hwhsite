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
router.get('/:newId', function(req, res, next) {
  const newId = req.params.newId
  Promise.all([
    NewsModel.getOne(newId),
    CommentModel.getComments(newId),
    NewsModel.incPv(newId),
  ])
  .then(result => {
    let article = result[0]
    if (article) {
      article.tag = article.tag ? article.tag.split(/，|\/|,|\\|-|&|\||@|·/) : []
      article.pv = article.pv || 0
      res.render('article', {
        article: article,
        comments: result[1], 
        originalUrl: req.originalUrl,
        articleType: 'news',
        disclaimer: '内容均来自网络，侵删'
      })
    } else {
      res.redirect('/')
    }
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
router.post('/:type/:articleId/edit', checkLogin, (req, res, next) => {
  let articleId = req.params.articleId
  let type = req.params.type
  const title = req.fields.title
  const content = req.fields.content
  const tag = req.fields.tag || '原创'
  const ts = (new Date()).getTime()
  const mark = type === 'banner' ? 'banner': 'normal'
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
      ts,
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
