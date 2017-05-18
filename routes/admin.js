const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const EmailCode = require('../models/code')
const path = require('path')
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const checkLogin = require('../middlewares/check').checkLogin
const checkNotLogin = require('../middlewares/check').checkNotLogin

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
router.get('/reset', checkNotLogin, function (req, res, next) {
  res.render('login', {
    type: 'reset',
    articleType: null,
    originalUrl: null
  })
})
router.post('/reset/code', function (req, res, next) {
  // res.status(404).render('404')
  let code = EmailCode.getCode().join('')
  const  email = req.fields.email
  const transporter = nodemailer.createTransport(
    {
      host: "smtp.qq.com",
      post: '465',
      auth:{
        user: '838186163@qq.com',
        pass: 'iwtzecklxcjmbcej'
      },
      requireTLS: true,
      secure:true,
      debug:true
    }
  )
  transporter.sendMail({
    from:'HwH小站 <838186163@qq.com>',                   //发送邮箱
    to: email,
    subject: 'HwH小站邮箱验证码',
    html: `<div>验证码：<b>${code}</b></div>`,                     //生成的html源码
    text: `验证码${code}`                     //生成的text源码
  }, function(error, info){
      if(error){
        return res.send({
          status: 'fail',
          mes: '系统错误'
        })
      }
      req.session.code = code
      req.session.expires = (new Date()).getTime()
      return res.send({
        status: 'ok',
        mes: '验证码已发送，查看你邮箱'
      })
  })
  // res.send({
  //   status: 'ok',
  //   mes: '验证码已发送，查看你邮箱'
  // })
})
router.get('/stats', function (req, res, next) {
  res.render('stats')
})
router.post('/reset', function (req, res, next) {
  const  name = req.fields.name
  const  code = req.fields.email_code
  const  password = req.fields.password
  const  repassword = req.fields.repassword
  req.flash('error', '用户不存在')
  return res.redirect('back')
})
module.exports = router
