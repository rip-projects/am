var sprintf = require('sprintf').sprintf,
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    utilf = require('../utils/file');

exports.register = function(am) {
  var cmd = am.cli.command('publish')
    .description('publish the package')
    .option('-p, --private', 'private publish')
    .option('-d, --dev', 'development publish')
    .option('-r, --remove', 'remove publish')
    .action(function(name) {
      var cacheDir;

      if (cmd.remove) {
        am.logInfo('unpublish the package');
        var group;
        if (arguments.length <= 1) {
          name = am.config.package.name;
          group = am.config.package.group.split('.').join('/');
        }

        cacheDir = path.join(am.config.cache,
          group.split('.').join('/'), name);
        utilf.removeRecursive(cacheDir);

        cacheDir = path.resolve(cacheDir + '/..');

        while(cacheDir != am.config.cache) {
          if (fs.readdirSync(cacheDir).length > 0) {
            break;
          }
          utilf.removeRecursive(cacheDir);
          cacheDir = path.resolve(cacheDir + '/..');
        }
        console.log();
        return;
      }

      if (!am.config.ispackage) {
        am.logError('Not at package dir');
        process.exit(1);
        return;
      }

      am.logInfo(cmd.description());
      if (cmd.dev) {
        cacheDir = path.join(am.config.cache,
          am.config.package.group.split('.').join('/'),
          am.config.package.name,
          am.config.package.version);
        mkdirp.sync(cacheDir);
        utilf.removeRecursive(cacheDir);

        fs.symlinkSync(am.config.cwd, cacheDir, 'dir');

      } else {
        am.logError('Without [-d, --dev] option, Unimplemented yet!');
        process.exit(1);
        if (!cmd.private) {

        }
      }
      console.log();
    });
};