var browserify = require('browserify');
var fs = require('fs');

var files = [ 'x.js', 'y.js' ];
var b = browserify(files);
b.plugin('factor-bundle', { outputs: [ 'bundle/x.js', 'bundle/y.js' ] });
b.bundle().pipe(fs.createWriteStream('bundle/common.js'));