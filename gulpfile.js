// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var rename = require("gulp-rename");
var stripdebug = require('gulp-strip-debug');
var htmlclean = require('gulp-htmlclean');
var cssnano = require('cssnano');
var postcss = require('gulp-postcss');
var htmlreplace = require('gulp-html-replace');
var webserver = require('gulp-webserver');

var baseDir = {
  src : './',
  dist: 'dist/'
};

var assets = {
  js: [
        baseDir.src + "assets/js/angular-modal-service.js",
        baseDir.src + "assets/js/angular-spotify.js",
        baseDir.src + "app/servicos/api/spot.js",
        baseDir.src + "app/componentes/home/home.js",
        baseDir.src + "app/app.js"
      ],
  css: [],
  images: [],
  vendorIn: [
    baseDir.src + "node_modules/angular/angular.min.js",
    baseDir.src + "node_modules/angular/angular.min.js.map",
    baseDir.src + "node_modules/angular-touch/angular-touch.min.js",
    baseDir.src + "node_modules/angular-touch/angular-touch.min.js.map",
    baseDir.src + "node_modules/angular-animate/angular-animate.min.js",
    baseDir.src + "node_modules/angular-animate/angular-animate.min.js.map",
    baseDir.src + "node_modules/angular-ui-router/release/angular-ui-router.min.js",
    baseDir.src + "node_modules/angular-busy/dist/angular-busy.min.js",
    baseDir.src + "node_modules/local-storage/dist/local-storage.js",

  ],
  vendorOut: [
    "node_modules/angular.min.js",
    "node_modules/angular-touch.min.js",
    "node_modules/angular-animate.min.js",
    "node_modules/angular-ui-router.min.js",
    "node_modules/angular-busy.min.js",
    "node_modules/local-storage.js",

  ]
};

//JS Tasks: lint, remove debug, Minify
//CSS Tasks: Minify
//Image: reduce
//HTML: minify and rename

// LintJS Task
gulp.task('lint', function() {
    //console.log("lint: ", assets.js);
    return gulp.src(assets.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('copy3rdPart', ['lint'], function() {
  return gulp.src(assets.vendorIn)
  .pipe(gulp.dest(baseDir.dist + 'node_modules/'))
});

//Minify JS
gulp.task('minifyJSAssets', ['copy3rdPart'], function() {
    return gulp.src(baseDir.src + 'assets/**/*.js')
        .pipe(stripdebug())
        .pipe(uglify())
        .pipe(gulp.dest(baseDir.dist + 'assets/'));
});

//Minify JS App
gulp.task('minifyJSApp', ['minifyJSAssets'], function() {
    return gulp.src(baseDir.src + 'app/**/*.js')
        .pipe(stripdebug())
        //.pipe(uglify())
        .pipe(gulp.dest(baseDir.dist + 'app/'));
});

gulp.task('images', ['minifyJSApp'], function() {
  var out = baseDir.dist + 'assets/Images/';
  return gulp.src(baseDir.src + 'assets/images/**/*')
  .pipe(newer(out))
  .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest(out));
});

gulp.task('htmlApp', ['images'], function() {
  var out = baseDir.dist + 'apps/';
  gulp.src(baseDir.src + 'apps/**/*.html')
  .pipe(htmlclean()).pipe(gulp.dest(out));

});

gulp.task('copyApp', ['lint'], function() {
  return gulp.src(baseDir.src + 'app/**/*.html')
  .pipe(gulp.dest(baseDir.dist + 'app/'))
});

gulp.task('htmlTemplate', ['htmlApp'], function() {
  var out = baseDir.dist + 'templates/';
  gulp.src(baseDir.src + 'templates/**/*.html')
  .pipe(htmlclean()).pipe(gulp.dest(out));

});

gulp.task('htmlIndex', ['htmlTemplate'], function() {
  var out = baseDir.dist;
  gulp.src(baseDir.src + '*.html')
  .pipe(htmlreplace({node_modules: assets.vendorOut}))
  .pipe(htmlclean())
  .pipe(gulp.dest(out));

});

gulp.task('css', ['htmlIndex'], function() {

  var postCssOpts = [];

  postCssOpts.push(cssnano);

  return gulp.src(baseDir.src + 'assets/**/*.css')
    .pipe(postcss(postCssOpts))
    .pipe(gulp.dest(baseDir.dist + 'assets/'));

});

//Call HTTP-SERVER
gulp.task('webserver', ['css'], function() {
  gulp.src(baseDir.dist)
    .pipe(webserver({
      port: 8089,
      path: 'dist',
      livereload: true,
      directoryListing: true,
      fallback: 'index.html'
      //open: true
    }));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(baseDir.src + 'assets/js/*.js', ['lint']);
    gulp.watch(baseDir.src + 'assets/css/*.css', ['css']);
});

//Call tasks
gulp.task('default', ['lint', 'copy3rdPart', 'minifyJSAssets', 'minifyJSApp', 'htmlApp', 'htmlTemplate', 'htmlIndex', 'images', 'css', 'copyApp']);
