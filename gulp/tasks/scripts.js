var gulp          = require('gulp'),
    browserSync   = require('browser-sync'),
    opn           = require('opn'),
    jshintStylish = require('jshint-stylish'),
    mode          = require('../util/mode'),
    errorHandler  = require('../util/error-handler'),
    $             = require('gulp-load-plugins')({
                        patter: ['gulp-*']
                    });

var jshintNotifyMessageBuilder = function (file) {
    if (file.jshint.success) {
        return false;
    }
    var errors = file.jshint.results.map(function (data) {
        if (data.error) {
            return "(" + data.error.line + ":" + data.error.character + ") "
                + data.error.reason;
        }
    }).join("\n");
    return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
};

var jshintNotifyOptions = {
    message : jshintNotifyMessageBuilder,
    title: 'JSHint failure'
};

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(jshintStylish))
        .pipe($.notify(jshintNotifyOptions))
        .pipe(browserSync.reload({stream:true}));
});
