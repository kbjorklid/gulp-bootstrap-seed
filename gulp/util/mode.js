module.exports = {
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
