var marked = require('marked');
var NewPost = require('../lib/mongo').New
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
