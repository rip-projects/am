var exec = require('child_process').exec,
    path = require('path');

var Script = function(am) {
  this.am = am;
};

Script.prototype.run = function(pkg, name) {
  pkg = pkg || new this.am.AM.Package(this.am);
  var cmd = pkg.data.scripts[name];

  exec('cd ' + path.resolve(pkg.cwd) + ' && ' + cmd, function(err, d) {
    console.log(d);
  });
};

exports = module.exports = Script;