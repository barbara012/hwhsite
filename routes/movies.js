const MoviesModel = require('../models/movies')
const express = require('express')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  let pCount = MoviesModel.getCount()
  let pMovies = MoviesModel.getMovies(page)
  Promise.all([pCount, pMovies]).then(result => {
    // console.log(result)
    // let articles = result[1].map((article) => {
    //   let r = article.content.match(/<img.+?>/)
    //   // let content = article.content.replace(/\s/g, '')
    //   let rendNumber = Math.random() * (200 - 150 + 1) + 150
    //   let p = article.content.replace(/<[^>]+>/g, '')
    //   article.img = r ? r[0] : ''
    //   article.content = p.substr(0, rendNumber) + '...'
    //   article.tag = article.tag ? article.tag.split(/，|,|·|&|‖/) : []
    //   return article
    // })
    res.render('movies', {
      movies: result[1],
      isFirstPage: page === 1,
      isLastPage: page * 9 >= result[0],
      articleType: 'movies',
      page: page
    })
  }).catch(next)
})
router.get('/:movieId', function(req, res, next) {
  const movieId = req.params.movieId
  MoviesModel.getOne(movieId)
    .then(function (movie) {
      // article.tag = article.tag ? article.tag.split('，') : []
      res.render('movie', {
        movie: movie,
        articleType: 'movies',
        disclaimer: '内容均来自网络，侵删'
      })
    })
    .catch(next)
})
module.exports = router
