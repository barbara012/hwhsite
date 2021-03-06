const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('login', {
    type: 'signup',
    articleType: null,
    originalUrl: null
  })
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
  let name = req.fields.name
    // var gender = req.fields.gender
    // var bio = req.fields.bio;
    // var avatar = req.files.avatar.path.split(path.sep).pop();
  let password = req.fields.password
  let repassword = req.fields.repassword
  let from = req.query.from || '/'

    // 校验参数
  try {
    let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    if (!reg.test(name)) {
      throw new Error('邮箱格式有误')
    }
    if (!(name.length >= 5 && name.length <= 20)) {
      throw new Error('名字请限制在 5-20 个字符')
    }
    // if (['m', 'f', 'x'].indexOf(gender) === -1) {
    //     throw new Error('性别只能是 m、f 或 x');
    // }
    // if (!(bio.length >= 1 && bio.length <= 30)) {
    //     throw new Error('个人简介请限制在 1-30 个字符');
    // }
    // if (!req.files.avatar.name) {
    //     throw new Error('缺少头像');
    // }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
  } catch (e) {
    // 注册失败，异步删除上传的头像
    // fs.unlink(req.files.avatar.path);
    req.flash('error', e.message)
    return res.redirect('back')
  }

    // 明文密码加密
  password = sha1(password)

    // 待写入数据库的用户信息
  let user = {
    name: name,
    password: password
  }
    // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0]
      // 将用户信息存入 session
      delete user.password
      req.session.user = user
      // 写入 flash
      req.flash('success', '注册成功')
      // 跳转到首页
      res.redirect(from)
    })
    .catch(function (e) {
        // 注册失败，异步删除上传的头像
      // fs.unlink(req.files.avatar.path)
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用')
        return res.redirect('back')
      }
      next(e)
    })
})

module.exports = router