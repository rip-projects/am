var semver = require('semver'),
    path = require('path'),
    fs = require('fs'),
    sprintf = require('sprintf').sprintf,
    async = require('async'),
    utilf = require('./utils/file'),
    mkdirp = require('mkdirp');

var Cache = function(am) {
  this.am = am;
};

Cache.prototype.getCollection = function(url) {
  var that = this;
  var parsed = this.parseUrl(url);
  var col = {
    path: path.join(this.am.config.cache, parsed.group.split('.').join('/'), parsed.name),
    parsed: parsed,
    versions: function() {
      var files = fs.readdirSync(this.path);
      var result = [];
      for(var i in files) {
        if (semver.valid(files[i])) {
          result.push(files[i]);
        }
      }
      return result;
    },
    satisfyVersion: function() {
      return semver.maxSatisfying(this.versions(), this.parsed.version);
    },
    satisfyPackage: function() {
      var sat = this.satisfyVersion();
      if (sat) {
        return new that.am.AM.Package(that.am, path.join(this.path, sat));
      }
    }
  };

  return col;
};

Cache.prototype.fetch = function(url, cb) {
  var col = this.getCollection(url);
  var package = col.satisfyPackage();
  console.log(package.data.arkDependencies);

  cb(null, package);
};

Cache.prototype.install = function(package, to, cb) {
  var copy = function(from, to) {
    mkdirp.sync(to);
    var files = fs.readdirSync(from);
    for(var i in files) {
      if (files[i] !== '.git') {
        var f = path.join(from, files[i]);
        var fto = path.join(to, files[i]);
        var stat = fs.lstatSync(f);
        if (stat.isDirectory()) {
          copy(f, fto);
        } else {
          utilf.copySync(f, fto);
        }
      }
    }
  };

  if (package) {
    copy(package.cwd, to);
  }
  if (cb) cb();
};

Cache.prototype.parseUrl = function(url) {
  var split = url.match(/^(?:([a-zA-Z0-9+]+):\/\/)*(.*)$/);
  split = {
    url: url,
    protocol: split[1]
  };
  if (!split.protocol) {
    split.protocol = split.type = 'ark';
    var g = split.url.split(':');
    g[1] = g[1].split('@');

    split.group = g[0];
    split.name = g[1][0];
    split.version = g[1][1] || null;
  } else {
    if (split.protocol.indexOf('git') === 0) {
      split.type = 'git';
    }
    this.am.logError('protocol', split.protocol.yellow.bold, 'unimplemented yet!');
    process.exit(1);
  }
  return split;
};

exports = module.exports = Cache;