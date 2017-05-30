const checkLogin = require('../middlewares/check').checkLogin
module.exports = function (app) {
  app.use('/signup', require('./signup'))
  app.use('/signin', require('./signin'))
  app.use('/signout', require('./signout'))
  app.use('/posts', require('./posts'))
  app.use('/news', require('./news'))
  app.use('/', require('./root'))
  app.use('/articles', require('./articles'))
  app.use('/movies', require('./movies'))
  app.use('/admin', require('./admin'))
  app.use('/search', require('./search'))
  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404')
    }
  })
}

