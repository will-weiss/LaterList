/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var browserify = require('browserify'),
  gulp = require('gulp'),
  transform = require('vinyl-transform'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  path = require('path'),
  coverageEnforcer = require("gulp-istanbul-enforcer"),
  istanbul = require('gulp-istanbul'),
  mocha = require('gulp-mocha'),
  jsdoc = require('gulp-jsdoc');

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

gulp.task('doc', function() {
  gulp.src(["./lib/**/*.js", "README.md"])
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator('./docs', {
      path: './node_modules/jsdoc-oblivion/template',
      "systemName"      : "LaterList",
      "footer"          : "",
      "navType"         : "vertical",
      "theme"           : "oblivion",
      "linenums"        : true,
      "collapseSymbols" : false,
      "inverseNav"      : true
    }, {
      "recurse": true,
      "cleverLinks": true,
      "monospaceLinks": false,
      "default": {
        "outputSourceFiles": true
      },
    }))
});

gulp.task('default', ['dist']);
