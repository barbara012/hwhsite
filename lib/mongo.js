var config = require('config-lite')(__dirname);
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
        results.forEach(function (item) {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne: function (result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

exports.User = mongolass.model('User', {
    name: { type: 'string' },
    password: { type: 'string' },
    avatar: { type: 'string' },
    gender: { type: 'string', enum: ['m', 'f', 'x'] },
    bio: { type: 'string' }
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

exports.Post = mongolass.model('Post', {
    author: { type: Mongolass.Types.ObjectId },
    title: { type: 'string' },
    content: { type: 'string' },
    pv: { type: 'number' }
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

exports.New = mongolass.model('New', {
    author: { type: 'string' },
    sourceurl: { type: 'string' },
    title: { type: 'string' },
    pdate: { type: 'string' },
    ts: { type: 'number' },
    tag: { type: 'string' },
    content: { type: 'string' },
    pv: { type: 'number' }
});
exports.New.index({ title: 1}, { unique: true }).exec();// 按创建时间降序查看新闻文章列表

exports.JshuArticle = mongolass.model('JshuArticle', {
    author: { type: 'string' },
    sourceurl: { type: 'string' },
    title: { type: 'string' },
    pdate: { type: 'string' },
    ts: { type: 'number' },
    tag: { type: 'string' },
    content: { type: 'string' },
    pv: { type: 'number' }
});
exports.JshuArticle.index({ title: 1}, { unique: true }).exec();// 按创建时间降序查看简书文章列表

/*
title,
content,
sourceurl,
starring,
pushDate,
release,
subtitles,
name,
cover,
withMap,
director,
duration,
type,
score,
ts
*/
exports.Movies = mongolass.model('Movies', {
    content: { type: 'string' }, //电影简介
    cover: { type: 'string' }, // 封面
    director: { type: 'string' }, // 导演
    duration: { type: 'string' }, // 电影时长
    name: { type: 'string' }, // 电影名
    release: { type: 'string' }, // 上映日期
    pv: { type: 'number' }, // 访问量
    pushDate: { type: 'string' }, // 上映年代
    sourceurl: { type: 'string' }, // 原始链接 
    score: { type: 'string' }, // 评分 IMDb
    starring: { type: 'string' }, // 主演
    subtitles: { type: 'string' }, // 字幕
    title: { type: 'string' }, // 标题
    movieType: { type: 'string' },// 电影类型
    ts: { type: 'number' }, // 抓取时间
    withMap: { type: 'string' }, // 电影配图
    download: { type: 'string'} // 下载链接
});
exports.Movies.index({ title: 1}, { unique: true }).exec();// 按创建时间降序查看简书文章列表

exports.Comment = mongolass.model('Comment', {
    author: { type: Mongolass.Types.ObjectId },
    content: { type: 'string' },
    postId: { type: Mongolass.Types.ObjectId }
});
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言
