'use strict';
var gulp = require('gulp'),
    del  = require('del');

require('require-dir')('./gulp/tasks');

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

