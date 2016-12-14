/**
 * thank for https://github.com/bustardcelly/gulp-rev-append
 * @type {[type]}
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var map = require('event-stream').map;

var FILE_DECL = /(?:href=|src=|url\()['|"]([^\s>"']+?)\?ver=([^\s>"']+?)['|"]/gi;

var version = function() {

  // cli setup dirname
  var INIT_PWD = this.process.env.PWD;

  function relPath(dir, abs_file) {

    var file_tmp = abs_file.split(path.sep);
    var index= dir.lastIndexOf(file_tmp[1]);
    if (index !== 0) {
        return  path.resolve(dir.substring(0,index))+abs_file;
    }
    return abs_file;

  }

  return map(function(file, cb) {

    var contents;
    var lines;
    var i, length;
    var line;
    var groups;
    var declarations;
    var dependencyPath;
    var data, hash;

    if(!file) {
      throw new PluginError('gulp-version-append', 'Missing file option for gulp-rev-append.');
    }

    if(!file.contents) {
      throw new PluginError('gulp-version-append', 'Missing file.contents required for modifying files using gulp-rev-append.');
    }

    contents = file.contents.toString();
    lines = contents.split('\n');
    length = lines.length;
    for(i = 0; i < length; i++) {
      line = lines[i];
      declarations = line.match(FILE_DECL);
      if (declarations && declarations.length > 0) {
        for(var j = 0; j < declarations.length; j++) {
          groups = FILE_DECL.exec(declarations[j]);
          if(groups && groups.length > 1) {
            // are we an "absoulte path"? (e.g. /js/app.js)
            var normPath = path.normalize(groups[1]);
            if (normPath.indexOf(path.sep) === 0) {
              // return the real absolute dirname 
              // such as <script src="/js/app.js">
              // which is the base name
              // so /data/sites/domain.cn/
              dependencyPath = relPath(INIT_PWD,normPath);

            }
            else {
              dependencyPath = path.resolve(path.dirname(file.path), normPath);
            }

            try {
              data = fs.readFileSync(dependencyPath);
              hash = crypto.createHash('md5');
              hash.update(data.toString(), 'utf8');
              line = line.replace(groups[2], hash.digest('hex').slice(0, 10));
            }
            catch(e) {
              throw new PluginError('gulp-version-append', 'file not exist');
              // fail silently.
            }
          }
          FILE_DECL.lastIndex = 0;
        }
        lines[i] = line;
      }
    }

    file.contents = new Buffer(lines.join('\n'));
    cb(null, file);

  });

};

module.exports = version;