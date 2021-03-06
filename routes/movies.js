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
    let movies = result[1].map(movie => {
      movie.name = movie.name.split('/')[0]
      return movie
    })
    res.render('movies', {
      movies: movies,
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
  Promise.all([
    MoviesModel.getOne(movieId),
    MoviesModel.incPv(movieId)
  ])
  .then(result => {
    res.render('movie', {
      movie: result[0],
      articleType: 'movies',
      originalUrl: req.originalUrl,
      disclaimer: '内容均来自网络，侵删'
    })
  })
  .catch(next)
})
module.exports = router
