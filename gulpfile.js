'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var del = require('del');
var glob = require('glob');
var gulpif = require('gulp-if');
var mainBowerFiles = require('main-bower-files');

var $ = require('gulp-load-plugins')();

// This variable is set depending on what kind of
// execution (watch or dist) it is to make
var mode = {
    _compileMode : 'dist',
    isDist   : function() { return this._compileMode === 'dist'; },
    isWatch  : function() { return this._compileMode === 'watch'; },
    setDist  : function() { this._compileMode = 'dist'; },
    setWatch : function() { this._compileMode = 'watch'; }
}

gulp.task('styles', function() {
    return gulp.src('app/styles/main.scss')
        .pipe($.sass({errLogToConsole: true}))
        .pipe(
            gulpif(mode.isDist(), $.size({
              title: 'CSS size before processing',
              showFiles: true
            }))
        )
        .pipe(
            gulpif(mode.isDist(), $.uncss({
                html: glob.sync('app/**/*.html')
            }))
        )
        .pipe(gulpif(mode.isDist(), $.csso()))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('app/styles'))
        .pipe(reload({stream:true}))
        .pipe(gulpif(mode.isDist(), $.size({
            title: 'CSS size after processing',
            showFiles: true
        })))
        .pipe(
            gulpif(mode.isWatch(), $.notify("Style compilation complete."))
        );
});

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
    del([
        'app/styles/main.css',
        'dist'
    ], cb);
});

gulp.task('build', ['html', 'images', 'fonts']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('serve', ['styles'], function () {
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

gulp.task('setwatchmode', [], function () {
    mode.setWatch();
});

gulp.task('watch', ['setwatchmode', 'serve'], function () {
    gulp.watch(['app/*.html'], reload);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
