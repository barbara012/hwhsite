var marked = require('marked');
var NewPost = require('../lib/mongo').New;

module.exports = {
    // 创建一篇文章
  create: function create(article) {
    return NewPost.create(article).exec();
  },
  getNews: function getNews() {
    var query = {}
    return NewPost
      .find(query)
      .addCreatedAt()
      .sort({ created_at: -1 })
      .exec()
  },
  getOne: function getOne(newId) {
    return NewPost
      .findOne({_id: newId})
      .addCreatedAt()
      .exec()
  }
}
