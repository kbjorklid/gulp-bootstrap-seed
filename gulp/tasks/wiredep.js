var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    mode        = require('../util/mode'),
    wiredep     = require('wiredep').stream,
    $           = require('gulp-load-plugins')();

// inject bower components
gulp.task('wiredep', function (cb) {

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
    cb();
});
