var path = require('path'),
    exec = require('child_process').exec,
    sprintf = require('sprintf').sprintf,
    AM = require('../am'),
    utilf = require('../utils/file'),
    Package = require('../utils/package'),
    fs = require('fs');

var Config = function() {
  this.cwd = path.resolve('.');
  this.userhome = utilf.getHomeDir();
  this.cache = path.join(this.userhome, '.ark/cache');
  this.config = path.join(this.userhome, '.ark/config');
  this.npm = 'npm';
  this.registry = 'http://localhost/am-repo/www/index.php/';

  if (process.env.ARK_CACHE) {
    this.cache = path.resolve(process.env.ARK_CACHE);
  }

  if (process.env.ARK_CONFIG) {
    this.config = path.resolve(process.env.ARK_CONFIG);
  }

  if (process.env.ARK_NPM) {
    this.npm = process.env.ARK_NPM;
  }

  mkdir('-p', this.cache);

  var package = new Package();
  this.package = package.getData();
  this.ispackage = package.isPackage();

  if (fs.existsSync(this.config)) {
    var data = JSON.parse(fs.readFileSync(this.config, 'utf8'));
    for(var i in data) {
      if (this._exclude(i, data[i])) {
        continue;
      }
      this[i] = data[i];
    }
  }
};

Config.prototype.set = function(key, value) {
  this[key] = value;
  this.save();
};

Config.prototype.get = function(key) {
  return this[key];
};

Config.prototype._exclude = function(a, b) {
  return a == 'cwd' || a == 'userhome' || a == 'confag' || a == 'package' || a == 'ispackage' || typeof b == 'function';
};

Config.prototype.save = function() {
  var data = {};
  for(var i in this) {
    if (this._exclude(i, this[i])) {
      continue;
    }
    data[i] = this[i];
  }
  fs.writeFileSync(this.config, JSON.stringify(data, null, 2));
};

Config.instance = null;
Config.getInstance = function() {
  if (Config.instance === null) {
    Config.instance = new Config();
  }
  return Config.instance;
};

Config.register = function(am) {
  var cmd = am.cli.command('config')
    .option('-p, --plain', 'show plain config')
    .description('configuration')
    .action(am.defaultAction);

  cmd.command('list')
    .description('list configuration')
    .action(function(subc) {
      if (cmd.plain) {
        console.log(JSON.stringify(Config.getInstance(), null, 2));
      } else {
        am.logInfo('list configuration');
        for (var i in Config.getInstance()) {
          if (i != 'am' && typeof Config.getInstance()[i] != 'function') {
            console.log(sprintf('%-10s'.blue.bold + ': %s', i, JSON.stringify(Config.getInstance()[i], null, 2)));
          }
        }
      }
      console.log();
    });
};

exports = module.exports = Config;