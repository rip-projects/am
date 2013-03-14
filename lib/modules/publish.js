var sprintf = require('sprintf').sprintf,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    utilf = require('../utils/file'),
    Package = require('../utils/package'),
    Config = require('../modules/config');


var Publish = function() {

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

        var group;
        if (arguments.length <= 1) {
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
        cacheDir = path.join(config.cache,
          config.package.group.split('.').join('/'),
          config.package.name,
          config.package.version);
        mkdirp.sync(cacheDir);
        utilf.removeRecursive(cacheDir);

        fs.symlinkSync(config.cwd, cacheDir, 'dir');

      } else {
        am.logError('Without [-d, --dev] option, Unimplemented yet!');
        process.exit(1);
        if (!cmd.private) {

        }
      }
      console.log();
    });
};

exports = module.exports = Publish;