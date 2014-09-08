var sprintf = require('sprintf').sprintf,
    fs = require('fs'),
    path = require('path'),
    utilf = require('../utils/file'),
    Package = require('../utils/package'),
    Config = require('../modules/config'),
    request = require('request');


var Publish = function() {

};

Publish.prototype.publishDev = function() {
  var config = Config.getInstance();
  var cacheDir;
  cacheDir = path.join(config.cache,
    config.package.group.split('.').join('/'),
    config.package.name,
    config.package.version);
  mkdir('-p', cacheDir);
  utilf.removeRecursive(cacheDir);

  fs.symlinkSync(config.cwd, cacheDir, 'dir');
};

Publish.prototype.publish = function(cb) {
  var config = Config.getInstance();
  if (!config.user) {
    return cb && cb(new Error('No user'));
  }
  var cacheDir;
  cacheDir = path.join(config.cache,
    config.package.group.split('.').join('/'),
    config.package.name,
    config.package.version);

  this.remove();
  utilf.copyRecursive(config.cwd, cacheDir);

  utilf.compress(config.cwd, 'tmp', function(err, sum) {
    if (err) return cb && cb(err);

    var url = config.registry + 'repo/publish.json';

    var r = request.post(url, function(err, resp, body) {
      utilf.removeRecursive('tmp');
      if (err) return cb && cb(err);
      if (resp.statusCode != 200) {
        return cb && cb({ statusCode: resp.statusCode, body: body });
      }
      body = JSON.parse(body);
      if (body.error) return cb && cb(body.error);
      return cb && cb(null);
    });
    var form = r.form();
    form.append('username', config.user.username);
    form.append('password', config.user.password);
    form.append('sum', sum[0]);
    form.append('package', fs.createReadStream(sum[1]));
  });

};

Publish.prototype.unpublish = function(name) {
  this.remove(name);
};
Publish.prototype.remove = function(name) {
  var config = Config.getInstance();
  var cacheDir;
  var group;

  if (!name) {
    name = config.package.name;
    group = config.package.group.split('.').join('/');
  } else {
    name = name.split(':');
    group = name[0];
    name = name[1];
  }

  cacheDir = path.join(config.cache,
    group.split('.').join('/'), name);
  utilf.removeRecursive(cacheDir);

  cacheDir = path.resolve(cacheDir + '/..');

  while(cacheDir != config.cache) {
    if (fs.readdirSync(cacheDir).length > 0) {
      break;
    }
    utilf.removeRecursive(cacheDir);
    cacheDir = path.resolve(cacheDir + '/..');
  }
};

Publish.register = function(am) {
  var cmd = am.cli.command('publish')
    .description('publish the package')
    .option('-p, --private', 'private publish')
    .option('-d, --dev', 'development publish')
    .option('-r, --remove', 'remove publish')
    .action(function(name) {
      var cacheDir;
      var config = Config.getInstance();

      if (cmd.remove) {
        am.logInfo('unpublish the package');

        if (name == cmd && !config.ispackage) {
          return am.logError('Cannot unpublish non package dir');
        }

        Publish.getInstance().unpublish((config.ispackage)? null : name);
        console.log();
        return;
      }

      if (!config.ispackage) {
        am.logError('Not at package dir');
        process.exit(1);
        return;
      }

      am.logInfo(cmd.description());
      if (cmd.dev) {
        Publish.getInstance().publishDev();
      } else {
        cmd.confirm('are you sure? ', function(ok){
          if (ok) {
            Publish.getInstance().publish(function(err) {
              if (err) {
                if (typeof err == 'object' && err.length) {
                  for(var i in err) {
                    am.logError(err[i]);
                  }
                }
              } else {
                console.log('DONE');
              }
            });
          }
          process.stdin.destroy();
        }, true);
      }
    });
};

Publish.instance = null;
Publish.getInstance = function() {
  if (!Publish.instance) {
    Publish.instance = new Publish();
  }
  return Publish.instance;
};

exports = module.exports = Publish;