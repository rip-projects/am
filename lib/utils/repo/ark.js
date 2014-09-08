var Config = require('../../modules/config'),
    exec = require('child_process').exec,
    utilf = require('../../utils/file'),
    npmconf = require('npmconf'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    semver = require('semver'),
    Script = require('../../modules/script'),
    Package = require('../../utils/package'),
    AM = require('../../am'),
    crypto = require('crypto');

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

  var cacheDir = path.join(Config.getInstance().cache, that.parsed.group.split('.').join('/'), that.parsed.name);
  if (!fs.existsSync(cacheDir)) {
    AM.instance.req('repo/check/' + that.parsed.group + '/' + that.parsed.name, function(err, data) {
      if (err) return cb && cb(err);
      if (!data.max_satisfied) {
        return cb && cb(new Error('No package or version satisfied.'));
      }
      var d = data.versions[data.max_satisfied];

      AM.instance.dl('repo/get/' + d.group + '/' + d.name + '/' + d.version, function(err, tpath) {
        var shasum = crypto.createHash('sha1');
        var s = fs.ReadStream(tpath);
        s.on('data', function(d) {
          shasum.update(d);
        });

        s.on('end', function() {
          if (shasum.digest('hex') != d.sum) {
            return cb && cb(new Error('SHA1 sum not match'));
          }
          var hpath = path.join(path.dirname(tpath), '.' + path.basename(tpath));
          mv('-f', tpath, hpath);
          mkdir('-p', tpath);
          var npath = path.join(tpath, path.basename(tpath));
          mv('-f', hpath, npath);
          var ppath = path.join(tpath, 'package');
          utilf.extract(npath, ppath, function(err) {
            if (err) return cb && cb(err);
            npath = path.join(cacheDir, d.version);
            // console.log(path.dirname(npath));
            mkdir('-p', path.dirname(npath));
            mv(ppath, npath);
            // process.exit();
            cb(null, npath);
          });
        });
      });
    });
  } else {
    var files = fs.readdirSync(cacheDir);
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
  }

};

Ark.prototype.install = function(from) {
  var package = new Package(from);

  var to = '';

  var cPath = path.resolve(path.join('.ark', package.data.group.split('.').join('/'), package.data.name));
  mkdir('-p', path.dirname(cPath));

  if (test('-L', cPath)) {
    fs.unlinkSync(cPath);
  } else {
    rm('-rf', cPath);
  }
  if (this.dev) {
    fs.symlinkSync(from, cPath, 'dir');
  } else {
    cp('-R', from, cPath);
  }

  switch (package.data.type) {
    case 'theme':
      to = path.resolve(path.join('www/themes', package.data.name));
      if (test('-L', to)) {
        fs.unlinkSync(to);
      } else {
        rm('-rf', to);
      }
      fs.symlinkSync(cPath, to, 'dir');
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