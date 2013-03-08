var semver = require('semver'),
    path = require('path'),
    fs = require('fs');

var Cache = function(am) {
  this.am = am;
};

Cache.prototype.fetch = function(id, cli) {
  var oName = this.resolve(id, cli);
  var p = path.join(this.am.config.cache, oName.group.split('.').join('/'), oName.name);
  var files = fs.readdirSync(p);
  var v = semver.maxSatisfying(files, oName.version);

  p = new this.am.AM.Package(this.am, path.join(p, v));

  if (p.isPackage()) {
    console.log('fetch ' + p);
  }

  var deps = p.data.dependencies;
  for(var i in deps) {
    console.log('fetch ' + i + ' ' + deps[i]);
  }
  console.log();
};

Cache.prototype.resolve = function(id, cli) {
  var matches = id.match(/^([a-zA-Z0-9+]*):\/\/(.*)$/);
  if (!matches) {
    if (cli) {
      id = 'ark://' + id;
    } else {
      id = 'npm://' + id;
    }
    matches = id.match(/^([a-zA-Z0-9+]+):\/\/(.+)$/);
  }

  if (!matches) {
    this.am.logError('Package not match');
    process.exit(1);
  }
  // console.log(matches);

  var protocol = matches[1];
  var uri = matches[2];

  var o = {
    protocol: protocol,
    uri: uri
  };
  var g = uri.split(':');
  var n = g[1].split('@');
  o.url = id;
  o.group = g[0];
  o.name = n[0];
  o.version = n[1] || '*';
  return o;
};

Cache.prototype.copy = function() {
};

exports = module.exports = Cache;