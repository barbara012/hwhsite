const PostModel = require('../models/posts')
const JshuModel = require('../models/jsarticle')
const NewsModel = require('../models/news')
const ImageModel = require('../models/images')
const R = require('ramda')
const MoviesModel = require('../models/movies')
const CommentModel = require('../models/comments')
const path = require('path')
const express = require('express')
const router = express.Router()
const FormateData = require('../filters/index').formateArticle
const checkLogin = require('../middlewares/check').checkLogin

router.get('/', function(req, res, next) {
  // var author = req.query.author;
  let page = req.query.p || 1
  page = page * 1
  Promise.all([
    PostModel.getPosts(page, 10),
    MoviesModel.getMovies(1, 3),
    PostModel.getCount(),
    NewsModel.getHot(),
    JshuModel.getHot(),
    PostModel.getHot(),
    NewsModel.getBanner(),
    JshuModel.getBanner(),
    PostModel.getBanner()
  ])
  .then(result => {
    let articles = FormateData(result[0])
    let banner = R.concat(R.concat(result[6], result[7]), result[8]) //FormateData(result[6])
    banner = FormateData(banner)
    let newH = FormateData(result[3])
    let articleH = FormateData(result[4])
    let postH = FormateData(result[5])
    let sortByPv = R.descend(R.prop('pv'))
    let hotArticles = R.sort(sortByPv)(R.concat(R.concat(newH, articleH), postH))
    res.render('articles', {
      originalUrl: req.originalUrl,
      articleType: 'posts',
      hotArticles: hotArticles,
      banners: banner,
      articles: articles,
      movies: result[1],
      isFirstPage: page === 1,
      isLastPage: page * 10 >= result[2],
      page: page
    })
  })
  .catch(next)
})
router.get('/create', checkLogin, function(req, res, next) {
  // var author = req.query.author;
  res.render('post', {
    originalUrl: req.originalUrl,
    articleType: 'posts'
  })
})

// POST /posts 发表一篇文章
router.post('/create', checkLogin, function(req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content
  const tag = req.fields.tag || '原创'

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

  let post = {
    author: author,
    title: title,
    content: content,
    tag: tag,
    pv: 0
  }

  PostModel.create(post)
    .then(function (result) {
        // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发表成功')
      // 发表成功后跳转到该文章页
      // res.redirect(`/posts/${post._id}`)
      return res.send({
        status: 'ok',
        mes: '发表成功',
        url: `/posts/${post._id}`
      })
    })
    .catch(next)
})
//编辑banner
router.get('/banner/:articleId/edit', checkLogin, (req, res, next) => {
  let articleId = req.params.articleId
  PostModel.getOne(articleId)
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
  PostModel.updateOne(articleId, {
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
// 上传图片
router.post('/image', checkLogin, (req, res, next) => {
  const imagePath = req.files.upload_file.path.split(path.sep).pop()
  ImageModel.create({
    name: imagePath,
    path: `/img-db/${imagePath}`
  })
  .then(result => {
    res.send({
      success: true,
      msg: '成功',
      file_path: `/img-db/${imagePath}`
    })
  })
  .catch(next)
})
// GET /posts/:postId 单独一篇的文章页
router.get('/:articleId', function(req, res, next) {
  const articleId = req.params.articleId

  Promise.all([
    PostModel.getPostById(articleId),// 获取文章信息
    CommentModel.getComments(articleId),// 获取该文章所有留言
    PostModel.incPv(articleId)// pv 加 1
  ])
  .then(function (result) {
    let article = result[0];
    let comments = result[1]
    if (!article) {
      throw new Error('该文章不存在')
    }
    const author = article.author
    article.tag = article.tag ? article.tag.split(/，|\/|,|\\|-|&|\||@|·/) : []
    article.pv = article.pv || 0
    article.author = author.name
    article.userId = author._id
    res.render('article', {
      article: article,
      comments: comments,
      originalUrl: req.originalUrl,
      articleType: 'posts',
      disclaimer: '原创作品，转载请联系作者'
    })
  })
  .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;

    PostModel.getRawPostById(postId)
      .then(function (post) {
          if (!post) {
              throw new Error('该文章不存在');
          }
          if (author.toString() !== post.author._id.toString()) {
              throw new Error('权限不足');
          }
          res.render('edit', {
              post: post,
              stats: index
          });
      })
      .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
    var postId = req.params.postId;
    var author = req.session.user._id;
    var title = req.fields.title;
    var content = req.fields.content;

    PostModel.updatePostById(postId, author, { title: title, content: content })
        .then(function () {
            req.flash('success', '编辑文章成功');
            // 编辑成功后跳转到上一页
            res.redirect(`/posts/${postId}`);
        })
        .catch(next);
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
  let author
  if (req.session.user.privilege === 1) {
    author = null
  } else {
    author = req.session.user._id
  }
  PostModel.removeOne(articleId, author)
    .then(function (result) {
      if (result) {
        res.send({
          ok: 1,
          mes: '删除成功'
        })
      } else {
        res.send({
          ok: 1,
          mes: '未找到'
        })
      }
    })
    .catch(next)
})
module.exports = router
