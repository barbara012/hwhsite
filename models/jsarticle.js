var marked = require('marked');
var JshuPost = require('../lib/mongo').JshuArticle
module.exports = {
    // 创建一篇文章
  create: function create(article) {
    return JshuPost.create(article).exec();
  },
  getArticles: function getArticles(page) {
    let query = {}
    return JshuPost
      .find(query, {
        skip: (page - 1) * 10,
        limit: 10
      })
      .addCreatedAt()
      .sort({ ts: -1 })
      .exec()
  },
  getCount: function getCount () {
    let query = {}
    return JshuPost.count(query).exec()
  },
  getOne: function getOne(articleId) {
    return JshuPost
      .findOne({_id: articleId})
      .addCreatedAt()
      .exec()
  }
}