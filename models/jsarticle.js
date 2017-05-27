var marked = require('marked');
var JshuPost = require('../lib/mongo').JshuArticle
const CommentModel = require('./comments')
module.exports = {
    // 创建一篇文章
  create: function create(article) {
    article.path = '/articles/'  // 添加pathname 区分it，文集，原创
    return JshuPost.create(article).exec();
  },
  getArticles: function getArticles(page, size) {
    let query = {}
    return JshuPost
      .find(query, {
        skip: (page - 1) * size,
        limit: size
      })
      .addCreatedAt()
      .sort({ ts: -1 })
      .exec()
  },
  getHot: function getHot() {
    return JshuPost
      .find({}, {
        skip: 0,
        limit: 5
      })
      .addCreatedAt()
      .sort({ pv: -1 })
      .exec()
  },
  updateOne: function updateOne (articleId, data) {
    return JshuPost
      .update({ _id: articleId}, {$set: data})
  },
  getBanner: function getBanner (size) {
    return JshuPost.find({ mark: 'banner'},{
        skip: 0,
        limit: size
      })
      .addCreatedAt()
      .sort({ ts: -1 })
      .exec()
  },
  getCount: function getCount () {
    let query = {}
    return JshuPost.count(query).exec()
  },
  removeOne: function removeOne (articleId) {
    return JshuPost
      .remove({
        _id: articleId
      })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
            return CommentModel.delCommentsByPostId(articleId)
        }
      })
  },
  getByKeyWords: function getByKeyWords(keyWords) {
    let pattern = new RegExp("^.*" + keyWords + ".*$", "i")
    return JshuPost
      .find({
        $or: [
          {
            title: pattern
          },
          {
            content: pattern
          },
          {
            tag: pattern
          }
        ]
      })
      .sort({ _id: -1 })
      .addCreatedAt()
      .exec()
  },
  incPv: function incPv(articleId) {
    return JshuPost
      .update({ _id: articleId }, { $inc: { pv: 1 } })
      .exec();
  },
  getOne: function getOne(articleId) {
    return JshuPost
      .findOne({_id: articleId})
      .addCreatedAt()
      .exec()
  }
}