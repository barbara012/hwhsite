const User = require('../lib/mongo').User

module.exports = {
    // 注册一个用户
  create: function create(user) {
    return User.create(user).exec();
  },
  updateAvatar: function updateAvatar(name, data) {
    return User
      .update({ name: name }, {$set: data})
      .exec()
  },
  // 通过用户名获取用户信息
  getUserByName: function getUserByName(name) {
    return User
      .findOne({ name : name})
      .addCreatedAt()
      .exec()
  },
  updatePasswordByName: function getUserByName(name, data) {
    return User
      .update({ name : name}, { $set: data })
      .exec()
  }
}
