const marked = require('marked');
const NewPost = require('../lib/mongo').New
const CommentModel = require('./comments')
module.exports = {
    // 创建一篇文章
  create: function create(article) {
    article.path = '/news/'  // 添加pathname 区分it，文集，原创
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
  getByKeyWords: function getByKeyWords(keyWords) {
    let pattern = new RegExp("^.*" + keyWords + ".*$", "i")
    return NewPost
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
  getOne: function getOne(newId) {
    return NewPost
      .findOne({_id: newId})
      .addCreatedAt()
      .exec()
  }
}
