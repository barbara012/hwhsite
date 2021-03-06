const marked = require('marked')
const Post = require('../lib/mongo').Post

const CommentModel = require('./comments')

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count
        return post
      })
    }
    return post
  }
})

module.exports = {
    // 创建一篇文章
  create: function create(article) {
    article.path = '/posts/'  // 添加pathname 区分it，文集，原创
    return Post.create(article).exec()
  },

  // 通过文章 id 获取一篇文章
  getPostById: function getPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      // .contentToHtml()
      .exec()
  },

  // 按创建时间降序获取所有用户文章
  getArticles: function getArticles(page, size, lastTs) {
    var query = {}
    if (lastTs) {
      query = {
        ts: {$lt: lastTs}
      }
    }
    return Post
      .find(query, {
        skip: (page - 1) * size,
        limit: size
      })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .exec()
  },
  getHot: function getHot(size) {
    return Post
      .find({}, {
        skip: 0,
        limit: size
      })
      .addCreatedAt()
      .sort({ pv: -1 })
      .exec()
  },
  updateOne: function updateOne (postId, data) {
    return Post
      .update({ _id: postId}, {$set: data})
  },
  getBanner: function getBanner (size) {
    return Post.find({ mark: 'banner'},{
        skip: 0,
        limit: size
      })
      .addCreatedAt()
      .sort({ ts: -1 })
      .exec()
  },
  getCount: function getCount () {
    let query = {}
    return Post.count(query).exec()
  },
  // 按创建时间降序获取某个特定用户的所有文章
  getAuthorPosts: function getPosts(author) {
      const query = {};
      if (author) {
          query.author = author
      }
      return Post
        .find(query)
        .populate({ path: 'author', model: 'User' })
        .sort({ _id: -1 })
        .addCreatedAt()
        .addCommentsCount()
        // .contentToHtml()
        .exec()
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },
  // 通过文章 id 获取一篇原生文章（编辑文章）
  getRawPostById: function getRawPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec()
  },

  // 通过用户 id 和文章 id 更新一篇文章
  updatePostById: function updatePostById(postId, author, data) {
    return Post.update({ author: author, _id: postId }, { $set: data }).exec()
  },
  // 超级管理员删除文章
  removeOne: function removeOne (postId, author) {
    let query = {
      _id: postId
    }
    if (author) {
      query.author = auther
    }
    return Post
      .remove(query)
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
            return CommentModel.delCommentsByPostId(postId)
        }
      })
  },
  getByKeyWords: function getByKeyWords(keyWords) {
    let pattern = new RegExp("^.*" + keyWords + ".*$", "i")
    return Post
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
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .exec()
  },
  // 通过用户 id 和文章 id 删除一篇文章
  delPostById: function delPostById(postId, author) {
    return Post.remove({ author: author, _id: postId })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
            return CommentModel.delCommentsByPostId(postId)
        }
      })
  }
}
