const PostModel = require('../models/posts')
const UserModel = require('../models/users')
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
  const name = req.fields.email
  UserModel.getUserByName(name)
    .then(user => {
      try {
        if (!user) {
          throw new Error('邮箱不存在，请使用注册时的邮箱')
        }
      } catch (e) {
        return res.send({
          status: 'fail',
          mes: e.message
        })
      }
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
            mes: '验证码已发送，查看你邮箱，请在3分钟内使用'
          })
      })
    })
    .catch(next)
  // res.send({
  //   status: 'ok',
  //   mes: '验证码已发送，查看你邮箱'
  // })
})
router.get('/stats', function (req, res, next) {
  res.render('stats')
})
router.post('/reset', function (req, res, next) {
  const name = req.fields.name
  const code = req.fields.email_code
  const password = req.fields.password
  const repassword = req.fields.repassword
  const nowTime = (new Date()).getTime()
  UserModel.getUserByName(name)
    .then(user => {
      try {
        if (!user) {
          throw new Error('邮箱不存在，请使用注册时的邮箱')
        }
        if (code !== req.session.code) {
          throw new Error('验证码不正确')
        }
        if (nowTime - req.session.expires > 1000 * 60 * 3) {
          throw new Error('验证码已过期，请在3分钟内使用')
        }
        if (password !== repassword) {
          throw new Error('两次输入密码不一致，要仔细')
        }
      } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
      }
      req.flash('success', '修改成功')
      req.session.code = null
      req.session.expires = null
      return res.redirect('/signin')
    })
    .catch(next)
})
module.exports = router
