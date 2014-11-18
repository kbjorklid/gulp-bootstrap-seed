var gulp        = require('gulp'),
    gulpif      = require('gulp-if'),
    browserSync = require('browser-sync'),
    opn         = require('opn'),
    mode        = require('../util/mode'),
    $           = require('gulp-load-plugins')({
                      patter: ['gulp-*']
                  });

gulp.task('watch:html', [], function () {
    return gulp.src('app/**/*.html')
        .pipe($.filter(['*', '!**/bower_components']))
        .pipe(gulpif('**/*.html', browserSync.reload({stream:true, once:true})));
});

var browserSyncOptions = {
    server: {
        baseDir: ['.tmp', 'app'],
        directory: true
    },
    debugInfo: false,
    open: false,
    xip: true,
    startPath: "/index.html"
};

gulp.task('serve', ['wiredep', 'scripts', 'styles', 'watch:html'], function () {
    browserSync.init(null, browserSyncOptions, function (err, bs) {
        if (err) {
            console.log('Browser sync error: ' + err);
        } else {
            var url = bs.options.urls.local;
            opn(url);
            console.log('Started connect web server on ' + url);
        }
    });
});


gulp.task('watch:setmode', [], function () {
    mode.setWatch();
});

gulp.task('watch', ['watch:setmode', 'watch:internal'], function() {});
gulp.task('watch:dist', ['watch:internal'], function() {});

gulp.task('watch:internal', ['serve'], function () {
    gulp.watch(['app/**/*.html'], ['watch:html']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
