var marked = require('marked');
var MoviesPost = require('../lib/mongo').Movies
module.exports = {
    // 创建一篇文章
  create: function create(article) {
    return MoviesPost.create(article).exec();
  },
  getMovies: function getMovies(page, size) {
    let query = {}
    return MoviesPost
      .find(query, {
        skip: (page - 1) * size,
        limit: size
      })
      .addCreatedAt()
      .sort({ ts: -1 })
      .exec()
  },
  getCount: function getCount () {
    let query = {}
    return MoviesPost.count(query).exec()
  },
  getOne: function getOne(movieId) {
    return MoviesPost
      .findOne({_id: movieId})
      .addCreatedAt()
      .exec()
  }
}