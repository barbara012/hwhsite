const NewsModel = require('../news')
const JshuModel = require('../jsarticle')
const PostModel = require('../posts')
module.exports = {
  get (size) {
   return Promise.all([
      NewsModel.getHot(size),
      JshuModel.getHot(size),
      PostModel.getHot(size)
    ])
  }
}