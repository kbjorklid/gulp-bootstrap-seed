var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    opn         = require('opn'),
    glob        = require('glob'),
    mode        = require('../util/mode'),
    lazypipe    = require('lazypipe'),
    $           = require('gulp-load-plugins')();

// TODO: HTML lint?

var processStyles = lazypipe()
    .pipe($.size, {
              title: 'CSS size before processing',
              showFiles: true
            })
    .pipe($.uncss, {html: glob.sync('app/**/*.html')})
    .pipe($.autoprefixer, 'last 1 version')
    .pipe($.csso)
    .pipe($.size, {
              title: 'CSS size after processing',
              showFiles: true
            });

var processHtml = lazypipe()
    .pipe($.size, {title: "HTML: Size before processing"})
    .pipe($.minifyHtml)
    .pipe($.size, {title: "HTML: Size after processing"});

var processJs = lazypipe()
    .pipe($.size, {title: "JS: Size before processing"})
    .pipe($.uglify)
    .pipe($.size, {title: "JS: Size after processing"});

gulp.task('html', ['styles', 'scripts'], function () {
    var assets              = $.useref.assets();
    var jsFilter            = $.filter('**/*.js');
    var cssFilter           = $.filter('**/*.css');
    var bowerFilesFilter    = $.filter(['*', '!**/bower_components']);
    var htmlFilter          = $.filter(['**/*.html']);

    return gulp.src('app/**/*.html')
        .pipe(bowerFilesFilter)
        .pipe(assets)
        .pipe(jsFilter)
        .pipe(processJs())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(processStyles())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(htmlFilter)
        .pipe(processHtml())
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(mode.getDir()));
});
