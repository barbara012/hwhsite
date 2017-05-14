const gulp         = require('gulp')
const uglify       = require('gulp-uglify')
const less         = require('gulp-less')
const watch        = require('gulp-watch')
const runSequence  = require('run-sequence')
const rev          = require('gulp-rev')
const clean          = require('gulp-clean')
const htmlMin      = require('gulp-htmlmin')
const revCollector = require('gulp-rev-collector')

const config = {
  less: './static/less/*.less',
  js: './static/js/*.js',
  img: './static/img/*.{png,jpg,gif,ico,jpeg}',
  font: './static/font/*.{eot,svg,ttf,woff,woff2}',
  destCss: './static/dist/css',
  destJs: './static/dist/js',
  destImg: './static/dist/img',
  destFont: './static/dist/font',
  rev: './static/dist/rev/'
}

gulp.task('clean1', function() {
  return gulp.src('./views', {read: false}).pipe(clean())
})
gulp.task('clean2', function() {
  return gulp.src('./static/dist', {read: false}).pipe(clean())
})
gulp.task('font', function() {
  return gulp.src(config.font)
    .pipe(rev())
    .pipe(gulp.dest(config.destFont))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.rev + 'font'))
})
gulp.task('img', function() {
  return gulp.src(config.img)
    .pipe(rev())
    .pipe(gulp.dest(config.destImg))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.rev + 'img'))
})
gulp.task('js', function () {
  return gulp.src(config.js)
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(config.destJs))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.rev + 'js'))
})
gulp.task('less',  function () {
  return gulp.src(config.less)
    .pipe(less({
        compress: false
    }))
    .pipe(rev())
    .pipe(gulp.dest(config.destCss))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.rev + 'css'))
})
gulp.task('views', function() {
  return gulp.src('./vws/**/*.ejs', {base: './vws'})
    .pipe(htmlMin({
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//压缩HTML
      collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
      minifyJS: true,//压缩页面JS
      minifyCSS: true//压缩页面CSS
    }))
    .pipe(gulp.dest('./views'))
})
// gulp.task('mainFest', ['views'], function() {
//   gulp.src(['./static/dist/js/*.js', './static/dist/img/*.{png,jpg,gif,ico,jpeg}', './static/font/*.{eot,svg,ttf,woff,woff2}'])
//     .pipe(rev())
//     .pipe(rev.manifest())
//     .pipe(gulp.dest('./static/dist'))
// })
gulp.task('replaceEjs', function() {
  return gulp.src([config.rev + '**/*.json', './views/**/*.ejs'])
    .pipe(revCollector())
    .pipe(gulp.dest('./views'))
})
gulp.task('replaceCss', function() {
  return gulp.src([config.rev + '**/*.json', './static/dist/css/*.css'])
    .pipe(revCollector())
    .pipe(gulp.dest(config.destCss))
})
gulp.task('dev', function(done) {
  runSequence('clean1', 'clean2', 'font', 'img', 'js', 'less', 'views', 'replaceEjs', 'replaceCss', done)
})
gulp.task('default', ['dev'], function () {
  gulp.watch([config.less, config.js, config.font, './vws/**/*.ejs'], ['dev'])
})