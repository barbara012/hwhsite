const NewsModel = require('../news')
const JshuModel = require('../jsarticle')
const PostModel = require('../posts')
module.exports = {
  get (size) {
   return Promise.all([
      NewsModel.getBanner(size),
      JshuModel.getBanner(size),
      PostModel.getBanner(size)
    ])
  }
}