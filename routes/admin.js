const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const path = require('path')
const express = require('express')
const router = express.Router()
const checkLogin = require('../middlewares/check').checkLogin

router.get('/', checkLogin, (req, res, next) => {
  const author = req.session.user._id
  PostModel.getAuthorPosts(author)
    .then(result => {
      res.render('admin', {
        articles: result,
        active: 'posts'
      })
    })
    .catch(next)
})
router.get('/posts', checkLogin, (req, res, next) => {
  const author = req.session.user._id
  PostModel.getAuthorPosts(author)
    .then(result => {
      res.render('admin', {
        articles: result,
        active: 'posts'
      })
    })
    .catch(next)
})
router.post('/:articleId/remove', function(req, res, next) {
  if (req.session.user) {
    const articleId = req.params.articleId
    PostModel.delPostById(articleId, req.session.user._id)
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
router.get('/stats', function (req, res, next) {
  res.render('stats')
})
module.exports = router