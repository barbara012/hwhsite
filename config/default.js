module.exports = {
  port: 8080,
  session: {
    secret: 'huluwa',
    key: 'hwh',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/myblog'
}