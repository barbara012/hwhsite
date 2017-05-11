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
  img: './static/img/*.{png,jpg,gif,ico}',
  font: './static/font/*.{eot,svg,ttf,woff,woff2}',
  destCss: './static/dist/css',
  destJs: './static/dist/js',
  destImg: './static/dist/img',
  destFont: './static/dist/font'
}
gulp.task('js', function () {
  return gulp.src(config.js)
    .pipe(uglify())
    .pipe(gulp.dest(config.destJs))
})
gulp.task('less', function () {
  return gulp.src(config.less)
    .pipe(less({
        compress: true
    }))
    .pipe(gulp.dest(config.destCss))
})
gulp.task('img', function() {
  return gulp.src(config.img)
    .pipe(gulp.dest(config.destImg))
})
gulp.task('font', function() {
  return gulp.src(config.font)
    .pipe(gulp.dest(config.destFont))
})
gulp.task('views', function() {
  return gulp.src('./vws/**/*.ejs', {base: './vws'})
    .pipe(htmlMin({
      removeComments: true,
      collapseWhitespace: true,
      removeEmptyAttributes: true,
      minifyJS: true
    }))
    .pipe(gulp.dest('./views'))
})
gulp.task('lessWithOutCompress', function () {
  return gulp.src(config.less)
    .pipe(less())
    .pipe(gulp.dest(config.destCss))
})
gulp.task('mainFest', function() {
  gulp.src(['./static/dist/css/*.css', './static/dist/js/*.js', './static/dist/img/*.{png,jpg,gif,ico}'])
    .pipe(rev())
    .pipe(rev.manifest())
    .pipe(gulp.dest('./static/dist'))
})
gulp.task('replaceEjs', function() {
  return gulp.src(['./static/**/*.json', './views/**/*.ejs'])
    .pipe(revCollector())
    .pipe(gulp.dest('./views'))
})
gulp.task('replaceCss', function() {
  return gulp.src(['./static/**/*.json', './static/dist/css/*.css'])
    .pipe(revCollector())
    .pipe(gulp.dest(config.destCss))
})
gulp.task('dev', function(done) {
  runSequence('js', 'lessWithOutCompress', 'img', 'font', 'views',  'mainFest', 'replaceEjs', 'replaceCss', done)
})
gulp.task('release', function(done) {
  runSequence('js', 'less', 'img', 'font', 'views',  'mainFest', 'replaceEjs', 'replaceCss', done)
})
gulp.task('default', ['dev'], function () {
  gulp.watch([config.less, config.js, config.font, './vws/**/*.ejs'], ['dev'])
})