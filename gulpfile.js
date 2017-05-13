const gulp         = require('gulp')
const uglify       = require('gulp-uglify')
const less         = require('gulp-less')
const watch        = require('gulp-watch')
const runSequence  = require('run-sequence')
const rev          = require('./modules/gulp-rev')
const htmlMin      = require('gulp-htmlmin')
const revCollector = require('./modules/gulp-rev-collector')

const config = {
  less: './static/less/*.less',
  js: './static/js/*.js',
  img: './static/img/*.{png,jpg,gif,ico,jpeg}',
  font: './static/font/*.{eot,svg,ttf,woff,woff2}',
  destCss: './static/dist/css',
  destJs: './static/dist/js',
  destImg: './static/dist/img',
  destFont: './static/dist/font'
}
gulp.task('font',function() {
  return gulp.src(config.font)
    .pipe(gulp.dest(config.destFont))
})
gulp.task('img', ['font'], function() {
  return gulp.src(config.img)
    .pipe(gulp.dest(config.destImg))
})
gulp.task('js', ['img'], function () {
  return gulp.src(config.js)
    .pipe(uglify())
    .pipe(gulp.dest(config.destJs))
})
gulp.task('less', ['js'],  function () {
  return gulp.src(config.less)
    .pipe(less({
        compress: true
    }))
    .pipe(gulp.dest(config.destCss))
})
gulp.task('views', ['less'], function() {
  return gulp.src('./vws/**/*.ejs', {base: './vws'})
    .pipe(htmlMin({
      removeComments: true,
      collapseWhitespace: true,
      removeEmptyAttributes: true,
      minifyJS: true
    }))
    .pipe(gulp.dest('./views'))
})
gulp.task('mainFest', ['views'], function() {
  gulp.src(['./static/dist/css/*.css', './static/dist/js/*.js', './static/dist/img/*.{png,jpg,gif,ico,jpeg}', './static/font/*.{eot,svg,ttf,woff,woff2}'])
    .pipe(rev())
    .pipe(rev.manifest())
    .pipe(gulp.dest('./static/dist'))
})
gulp.task('replaceEjs', ['mainFest'], function() {
  return gulp.src(['./static/**/*.json', './views/**/*.ejs'])
    .pipe(revCollector())
    .pipe(gulp.dest('./views'))
})
gulp.task('replaceCss', ['replaceEjs'], function() {
  return gulp.src(['./static/**/*.json', './static/dist/css/*.css'])
    .pipe(revCollector())
    .pipe(gulp.dest(config.destCss))
})
gulp.task('default', ['replaceCss'], function () {
  gulp.watch([config.less, config.js, config.font, './vws/**/*.ejs'], ['replaceCss'])
})