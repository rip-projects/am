var path = require('path'),
    utilf = require('./file');


var Package = function(cwd) {
  this.cwd = path.resolve(cwd || '.');
  this.init();
};

Package.prototype.init = function() {
  this.data = utilf.readJson(path.join(this.cwd, 'package.json'));
};

Package.prototype.isPackage = function() {
  return (this.data !== null && typeof this.data == 'object');
};

Package.prototype.getData = function() {
  return this.data;
};

exports = module.exports = Package;