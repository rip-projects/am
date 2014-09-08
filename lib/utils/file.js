var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

var util = {
  getHomeDir: function(uri) {
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    return path.join(home, uri);
  },

  copyRecursive: function(from, to) {
    mkdir('-p', to);
    var files = fs.readdirSync(from);
    for(var i in files) {
      if (files[i] !== '.git' && files[i] !== 'node_modules'  && files[i] !== 'tmp') {
        var f = path.join(from, files[i]);
        var fto = path.join(to, files[i]);
        var stat = fs.lstatSync(f);
        if (stat.isDirectory()) {
          util.copyRecursive(f, fto);
        } else {
          util.copySync(f, fto);
        }
      }
    }
  },

  copySync: function(srcFile, destFile) {
    if (fs.existsSync(destFile)) {
      var stat = fs.lstatSync(destFile);
      if (stat.isDirectory) {
        destFile = path.join(destFile, path.basename(srcFile));
      }
    }

    var BUF_LENGTH = 64 * 1024;
    var buff = new Buffer(BUF_LENGTH);
    var fdr = fs.openSync(srcFile, 'r');
    var fdw = fs.openSync(destFile, 'w');
    var bytesRead = 1;
    var pos = 0;
    while (bytesRead > 0) {
      bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
      fs.writeSync(fdw,buff,0,bytesRead);
      pos += bytesRead;
    }
    fs.closeSync(fdr);
    fs.closeSync(fdw);
  },

  removeRecursive: function(spath) {
    if (!fs.existsSync(spath)) {
      return;
    }
    var stat = fs.lstatSync(spath);

    if (stat.isDirectory()) {
      var files = fs.readdirSync(spath);
      for(var i in files) {
        util.removeRecursive(path.join(spath, files[i]));
      }
      fs.rmdirSync(spath);
    } else {
      fs.unlinkSync(spath);
    }

  },

  readJson: function(cFile) {
    var exists = fs.existsSync(cFile);
    if (exists) {
    var d = fs.readFileSync(cFile, "utf8");
    d = JSON.parse(d);
    return d;
    } else {
    return null;
    }
  },

  compress: function(dir, to, cb) {
    this.removeRecursive(to);
    mkdir('-p', to);
    var cmd = 'tar cjf ' + to + '/package.tar.bz2 --exclude .git --exclude node_modules --exclude tmp --directory "' + dir + '" . && sha1sum ' + to + '/package.tar.bz2';
    exec(cmd, function(err, data) {
      if (err) return cb(err);
      cb(null, data.trim().split(/\s+/));
    });
  },

  extract: function(tarball, to, cb) {
    mkdir('-p', to);
    var cmd = 'tar xjf ' + tarball + ' --directory ' + to;
    exec(cmd, function(err, data) {
      if (err) return cb(err);
      cb(null);
    });
  }
};

exports = module.exports = util;