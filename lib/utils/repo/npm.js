var Config = require('../../modules/config'),
    exec = require('child_process').exec,
    utilf = require('../../utils/file'),
    npmconf = require('npmconf'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    semver = require('semver'),
    mkdirp = require('mkdirp'),
    Script = require('../../modules/script'),
    Package = require('../../utils/package');

var Npm = function(url) {
  if (typeof url == 'string') {
    this.url = url;
    throw new Error('Unimplemented yet, using string url. Currently only parsed url only');
  } else {
    this.parsed = url;
    this.url = this.parsed.url;
  }
};

Npm.prototype.fetch = function(cb) {
  var that = this;
  var c = Config.getInstance().npm + ' cache add ' + this.parsed.name + ((this.parsed.version) ? '@' + this.parsed.version : '');

  var cfg = null;
  var ver = null;
  async.parallel([
    function(next) {
      npmconf.load({some:'configs'}, function (er, conf) {
        cfg = conf;
        next();
      });
    },
    function(next) {
      exec(c, function() {
        // console.log(arguments);
        next();
      });
    }
  ], function() {
    var p = path.join(cfg.get('cache'), that.parsed.name, that.parsed.version);
    if (!that.parsed.version) {
      var files = fs.readdirSync(p);
      var result = [];
      for(var i in files) {
        if (semver.valid(files[i])) {
          result.push(files[i]);
        }
      }
      ver = semver.maxSatisfying(result, that.parsed.version);
      p = path.join(p, ver, 'package');
    }
    var to = path.join(Config.getInstance().cache, that.parsed.group.split('.').join('/'), that.parsed.name, ver);
    if (!fs.existsSync(to)) {
      utilf.copyRecursive(p, to);
    }

    if (cb) cb(null, to);
  });
};

Npm.prototype.install = function() {

};

Npm.prototype.installStandalone = function(from, to) {
  if (fs.existsSync(to)) {
    console.log('Cannot install standalone to ' + to);
    process.exit(1);
  }
  utilf.copyRecursive(from, to);
  var s = new Script();
  s.package = new Package(to);
  s.run('install', function() {
    console.log('DONE');
  });

};

exports = module.exports = Npm;