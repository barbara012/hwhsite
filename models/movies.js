var marked = require('marked');
var MoviesPost = require('../lib/mongo').Movies
module.exports = {
    // 创建一篇文章
  create: function create(movie) {
    movie.path = '/movies/'  // 添加pathname 区分it，文集，原创
    return MoviesPost.create(movie).exec();
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
  getHot: function getHot() {
    return MoviesPost
      .find({}, {
        skip: 0,
        limit: 5
      })
      .addCreatedAt()
      .sort({ pv: -1 })
      .exec()
  },
  incPv: function incPv(newId) {
    return MoviesPost
      .update({ _id: newId }, { $inc: { pv: 1 } })
      .exec();
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