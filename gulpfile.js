'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var del = require('del');
var glob = require('glob');
var gulpif = require('gulp-if');
var mainBowerFiles = require('main-bower-files');
var lazypipe = require('lazypipe');

var $ = require('gulp-load-plugins')();


// This variable is set depending on what kind of
// execution (watch or dist) it is to make
var mode = {
    _compileMode : 'dist',
    isDist   : function() { return this._compileMode === 'dist'; },
    isWatch  : function() { return this._compileMode === 'watch'; },
    setDist  : function() { this._compileMode = 'dist'; },
    setWatch : function() { this._compileMode = 'watch'; },
    getDir   : function() {
        if (this.isDist())  { return 'dist'; }
        if (this.isWatch()) { return '.tmp'; }
    }
}



/*
 * Style minification should not be done here. It is done in the 'html' task.
 */
gulp.task('styles', function() {
    return gulp.src('app/styles/main.scss')
        .pipe($.sass({errLogToConsole: true}))
        .pipe(gulp.dest(mode.getDir() + '/styles'))
        .pipe(reload({stream:true}))
        .pipe(
            gulpif(mode.isWatch(), $.notify("Style compilation complete."))
        );
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe(reload({stream:true}));
});


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

gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets = $.useref.assets();
    var bowerFilesFilter = $.filter(['*', '!**/bower_components']);
    var htmlFilter = $.filter(['**/*.html']);

    return gulp.src('app/**/*.html')
        .pipe(bowerFilesFilter)
        .pipe(assets)
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(processStyles())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(htmlFilter)
        .pipe($.size({title: "HTML: Size before processing"}))
        .pipe($.minifyHtml())
        .pipe($.size({title: "HTML: Size after processing"}))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(mode.getDir()));
});

gulp.task('watch:html', [], function () {
    return gulp.src('app/**/*.html')
        .pipe($.filter(['*', '!**/bower_components']))
        .pipe(gulpif('**/*.html', reload({stream:true, once:true})));
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(mode.getDir() + '/images'))
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
        .pipe(gulp.dest(mode.getDir() + '/fonts'))
        .pipe($.size({title: 'Fonts'}));
});

gulp.task('clean', function (cb) {
    del([
        'app/styles/main.css',
        'dist',
        '.tmp'
    ], cb);
});

gulp.task('build', ['wiredep', 'html', 'images', 'fonts']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('serve', ['build'], function () {
    browserSync.init(null, {
        server: {
            baseDir: ['.tmp', 'app'],
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
            exclude: ['bootstrap-sass-official', 'font-awesome']
        }))
        .pipe(gulp.dest('app'))
        .pipe(gulp.dest(mode.getDir()));
});

gulp.task('setwatchmode', [], function () {
    mode.setWatch();
});

gulp.task('watch', ['setwatchmode', 'watchinternal'], function() {});
gulp.task('distwatch', ['watchinternal'], function() {});

gulp.task('watchinternal', ['serve'], function () {
    gulp.watch(['app/**/*.html'], ['watch:html']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
