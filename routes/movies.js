const MoviesModel = require('../models/movies')
const express = require('express')
const async = require('async')
const router = express.Router()
router.get('/', function(req, res, next) {
  let page = req.query.p || 1
  page = page * 1
  let pCount = MoviesModel.getCount()
  let pMovies = MoviesModel.getMovies(page, 12)
  Promise.all([pCount, pMovies]).then(result => {
    res.render('movies', {
      movies: result[1],
      isFirstPage: page === 1,
      isLastPage: page * 12 >= result[0],
      articleType: 'movies',
      originalUrl: req.originalUrl,
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
        originalUrl: req.originalUrl,
        disclaimer: '内容均来自网络，侵删'
      })
    })
    .catch(next)
})
module.exports = router
