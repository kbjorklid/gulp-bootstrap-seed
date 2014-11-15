'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var gutil = require('gulp-util');
var del = require('del');
var glob = require('glob');
var gulpif = require('gulp-if');
var mainBowerFiles = require('main-bower-files');

var $ = require('gulp-load-plugins')();

var stylesFunctionBuilder = function(dist) {
    return function () {
        return gulp.src('app/styles/main.scss')
            .pipe($.sass({errLogToConsole: true}))
            .pipe(
                gulpif(dist, $.size({
                  title: 'CSS size before processing',
                  showFiles: true
                }))
            )
            .pipe(
                gulpif(dist, $.uncss({
                    html: glob.sync('app/**/*.html')
                }))
            )
            .pipe(gulpif(dist, $.csso()))
            .pipe($.autoprefixer('last 1 version'))
            .pipe(gulp.dest('app/styles'))
            .pipe(reload({stream:true}))
            .pipe(gulpif(dist, $.size({
                title: 'CSS size after processing',
                showFiles: true
            })))
            .pipe(
                gulpif(!dist, $.notify("Style compilation complete."))
            );
    };
};
gulp.task('styles', stylesFunctionBuilder(true));
gulp.task('stylesquick', stylesFunctionBuilder(false));

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets = $.useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(reload({stream:true, once:true}))
        .pipe($.size());
});

gulp.task('fonts', function () {
    var streamqueue = require('streamqueue');
    return streamqueue({objectMode: true},
        gulp.src(mainBowerFiles()),
        gulp.src('app/fonts/**/*')
    )
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('clean', function (cb) {
    //return gulp.src(['app/styles/main.css', 'dist'], { read: false }).pipe($.clean());
    del([
        'app/styles/main.css',
        'dist'
    ], cb);
});

gulp.task('build', ['html', 'images', 'fonts']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('serve', ['stylesquick'], function () {
    browserSync.init(null, {
        server: {
            baseDir: 'app',
            directory: true
        },
        debugInfo: false,
        open: false,
        xip: true,
        startPath: "/index.html"
    }, function (err, bs) {
        if (err) {
            console.log('Browser sync error: ' + err);
        } else {
            var url = bs.options.urls.local;
            require('opn')(url);
            console.log('Started connect web server on ' + url);
        }
    });
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));
    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            exclude: ['bootstrap-sass-official']
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['serve'], function () {

    // watch for changes
    gulp.watch(['app/*.html'], reload);

    gulp.watch('app/styles/**/*.scss', ['stylesquick']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});