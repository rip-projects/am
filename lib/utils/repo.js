var semver = require('semver'),
    path = require('path'),
    fs = require('fs'),
    sprintf = require('sprintf').sprintf,
    async = require('async'),
    utilf = require('./file'),
    AM = require('../am'),
    Config = require('../modules/config'),
    // RegClient = require('npm-registry-client'),
    exec = require('child_process').exec;

var Repo = function() {
};

Repo.prototype.getCollection = function(url) {
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

Repo.prototype.fetch = function(url, cb) {
  var col = this.getCollection(url);
  var package = col.satisfyPackage();

  cb(null, package);
};

Repo.prototype.install = function(package, to, cb) {
  var copy = function(from, to) {
    mkdir('-p', to);
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

Repo.parse = function(url) {
  var split = url.match(/^(?:([a-zA-Z0-9+]+):\/\/)*(.*)$/);
  var parsed = {
    protocol: split[1],
    url: url,
    type: null,
    group: null,
    name: null,
    version: null
  };
  if (!parsed.protocol) {
    parsed.protocol = parsed.type = 'ark';
    var g = parsed.url.split(':');
    g[1] = g[1].split('@');

    parsed.group = g[0];
    parsed.name = g[1][0];
    parsed.version = g[1][1] || null;
  } else {
    if (parsed.protocol.indexOf('git') === 0) {
      parsed.type = 'git';
    } else if (parsed.protocol.indexOf('npm') === 0) {
      parsed.type = 'npm';

      var split2 = split[2].match(/^((?:[^\/]*\/)+)([^@]+)(?:@(.*)+)*$/);

      parsed.registry = (parsed.protocol.split('+')[1] || 'http') + '://' + split2[1];
      if (parsed.registry.match(/^https*:\/\/\/$/)) {
        parsed.registry = null;
      }
      parsed.group = 'npm';
      parsed.name = split2[2];
      parsed.version = split2[3];
    } else {
      AM.instance.logError('protocol', parsed.protocol.yellow.bold, 'unimplemented yet!');
      process.exit(1);
    }
  }
  return parsed;
};

Repo.factory = function(name, dev) {
  var parsed = Repo.parse(name);
  var Driver = require('./repo/' + parsed.protocol);
  return new Driver(parsed, dev);
};

exports = module.exports = Repo;