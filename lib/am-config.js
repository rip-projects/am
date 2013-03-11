var path = require('path'),
    mkdirp = require('mkdirp'),
    utilf = require('./utils/file'),
    exec = require('child_process').exec;

var Config = function(am) {
  this.am = am;
  this.cwd = path.resolve('.');
  this.userhome = utilf.getHomeDir();
  this.cache = path.join(this.userhome, '.ark/cache');
  this.config = path.join(this.userhome, '.ark/config');

  if (process.env.ARK_CACHE) {
    this.cache = path.resolve(process.env.ARK_CACHE);
  }

  if (process.env.ARK_CONFIG) {
    this.config = path.resolve(process.env.ARK_CONFIG);
  }

  mkdirp.sync(this.cache);

  package = new this.am.AM.Package(this.am);
  this.package = package.getData();
  this.ispackage = package.isPackage();

};

exports = module.exports = Config;
