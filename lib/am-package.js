var path = require('path'),
    utilf = require('./utils/file');


var Package = function(am, cwd) {
  this.am = am;
  this.cwd = path.resolve(cwd || '.');
  this.data = utilf.readJson(path.join(this.cwd, 'package.json'));
};

Package.prototype.isPackage = function() {
  return (this.data !== null && typeof this.data == 'object');
};

Package.prototype.getData = function() {
  return this.data;
};

exports = module.exports = Package;