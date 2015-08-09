/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

"use strict";

var browserify = require('browserify'),
  gulp = require('gulp'),
  transform = require('vinyl-transform'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  path = require('path'),
  istanbul = require('gulp-istanbul'),
  mocha = require('gulp-mocha'),
  fs = require("fs"),
  gutil = require("gulp-util"),
  gulpJsdoc2md = require("gulp-jsdoc-to-markdown"),
  concat = require("gulp-concat"),
  mergeStream = require('merge-stream');


gulp.task('dist', function() {
  // transform regular node stream to gulp (buffered vinyl) stream
  var browserified = transform(function(filename) {
    var b = browserify({
      paths: [path.dirname(filename)]
    });
    b.require(path.basename(filename, '.js'));
    return b.bundle();
  });
  return gulp.src('lib/index.js')
    .pipe(browserified)
    .pipe(uglify())
    .pipe(rename({
      basename: 'laterlist',
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('coverage-test', function(cb) {
  gulp.src(['test/**/*.js'])
    .pipe(mocha())
    .on('end', function() {
      gulp.src(['lib/**/*.js'])
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
          gulp.src(['test/**/*.js'])
            .pipe(mocha({reporter: 'min'}))
            .pipe(istanbul.writeReports({
              reporters: ['json', 'lcovonly']
            }))
            .on('finish', function() {
              gulp.src('.')
                .on('end', cb);
            });
        });
    });
});

gulp.task("docs", function() {
  // Concatenate the jsdoc's and convert the documentation to markdown.
  var jsDocStream = gulp.src("lib/**/*.js")
      .pipe(concat("README.md"))
      .pipe(gulpJsdoc2md())
      .on("error", function(err){
          gutil.log("jsdoc2md failed:", err.message);
      });

  // Concatenate the existing README with the generated jsdoc markdown.
  return mergeStream(gulp.src("./lib/README.md"), jsDocStream)
    .pipe(concat("README.md"))
    .pipe(gulp.dest("./"));
});


gulp.task('default', ['docs', 'dist']);
