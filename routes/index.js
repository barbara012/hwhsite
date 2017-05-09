module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/news')
  })
  app.use('/signup', require('./signup'))
  app.use('/signin', require('./signin'))
  app.use('/signout', require('./signout'))
  app.use('/posts', require('./posts'))
  app.use('/news', require('./news'))
  app.use('/articles', require('./articles'))
  app.use('/movies', require('./movies'))
  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.render('404')
    }
  })
};
