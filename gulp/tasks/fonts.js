var gulp            = require('gulp'),
    browserSync     = require('browser-sync'),
    mode            = require('../util/mode'),
    mainBowerFiles  = require('main-bower-files'),
    streamqueue     = require('streamqueue'),
    $               = require('gulp-load-plugins')();

gulp.task('fonts', function () {
    return streamqueue({objectMode: true},
        gulp.src(mainBowerFiles(), { base : '../../app/bower_components' }),
        gulp.src('app/fonts/**/*')
    )
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(mode.getDir() + '/fonts'))
        .pipe($.size({title: 'Fonts'}));
});
