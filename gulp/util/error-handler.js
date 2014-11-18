var gulp        = require('gulp'),
    $           = require('gulp-load-plugins')();



module.exports = function(sourceDesc) {

    var message = "";
    if (sourceDesc) {
        message = "" + sourceDesc + ": ";
    }
    message += "<%= error.message %>";

    var onError = function (err) {
        $.notify.onError({
            message: message
        })(err);
        this.emit('end');
    };

    var plumberOptions = {
        errorHandler: onError
    };
    return $.plumber(plumberOptions);
};
