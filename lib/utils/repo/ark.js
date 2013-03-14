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

var Ark = function(url, dev) {
  this.dev = dev;

  if (typeof url == 'string') {
    this.url = url;
    throw new Error('Unimplemented yet, using string url. Currently only parsed url only');
  } else {
    this.parsed = url;
    this.url = this.parsed.url;
  }
};

Ark.prototype.fetch = function(cb) {
  var that = this;

  var files = fs.readdirSync(path.join(Config.getInstance().cache, that.parsed.group.split('.').join('/'), that.parsed.name));
  var result = [];
  for(var i in files) {
    if (semver.valid(files[i])) {
      result.push(files[i]);
    }
  }
  var ver = semver.maxSatisfying(result, that.parsed.version);

  if (!ver) {
    console.log('no version satisfy');
    process.exit(1);
  }

  var to = path.join(Config.getInstance().cache, that.parsed.group.split('.').join('/'), that.parsed.name, ver);
  if (cb) cb(null, to);
};

Ark.prototype.install = function(from) {
  var package = new Package(from);
  var to = '';
  switch (package.data.type) {
    case 'theme':
      to = path.resolve(path.join('www/themes', package.data.name));
      if (this.dev) {
        fs.symlinkSync(from, to, 'dir');
      } else {
        utilf.copyRecursive(from, to);
      }
      break;
    default:
      console.log('Install package with type:', package.data.type.red, 'unimplemented yet!');
      process.exit(1);
  }
  // throw new Error('Unimplemented yet');

};

Ark.prototype.installStandalone = function(from, to) {
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

exports = module.exports = Ark;