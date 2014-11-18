var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    mode        = require('../util/mode'),
    $           = require('gulp-load-plugins')();

var imageminOptions = {
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
};

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.size({title: "Images: Size before processing" }))
        .pipe($.imagemin(imageminOptions))
        .pipe(gulp.dest(mode.getDir() + '/images'))
        .pipe(browserSync.reload({stream:true, once:true}))
        .pipe($.size({title: "Images: Size after processing" }));
});
