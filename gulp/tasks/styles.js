var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    opn         = require('opn'),
    gulpif      = require('gulp-if'),
    mode        = require('../util/mode'),
    errorHandler= require('../util/error-handler'),
    $           = require('gulp-load-plugins')();

var sassConfig = {
    errLogToConsole : false
};

/*
 * Style minification should not be done here. It is done in the 'html' task, where the CSS files
 * are concatenated
 */
gulp.task('styles', function() {
    return gulp.src('app/styles/main.scss')
        .pipe(errorHandler("SASS"))
        .pipe($.sass(sassConfig))
        .pipe(gulp.dest(mode.getDir() + '/styles'))
        .pipe(browserSync.reload({stream:true}));
});
