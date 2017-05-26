const Images = require('../lib/mongo').Image
module.exports = {
  create: function create(pic) {
    return Images.create(pic).exec();
  },
  getImages: function getImages(page, size) {
    return Images
      .find({}, {
        skip: (page - 1) * size,
        limit: size
      })
      .addCreatedAt()
      .sort({ ts: -1 })
      .exec()
  }
}