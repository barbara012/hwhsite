var marked = require('marked');
var NewPost = require('../lib/mongo').New
const CommentModel = require('./comments')
module.exports = {
    // 创建一篇文章
  create: function create(article) {
    return NewPost.create(article).exec();
  },
  getNews: function getNews(page) {
    let query = {}
    return NewPost
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
    return NewPost.count(query).exec()
  },
  removeOne: function removeOne (newId) {
    return NewPost
      .remove({
        _id: newId
      })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
            return CommentModel.delCommentsByPostId(newId)
        }
      })
  },
  incPv: function incPv(newId) {
    return NewPost
      .update({ _id: newId }, { $inc: { pv: 1 } })
      .exec();
  },
  getOne: function getOne(newId) {
    return NewPost
      .findOne({_id: newId})
      .addCreatedAt()
      .exec()
  }
}
