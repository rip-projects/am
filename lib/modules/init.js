var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

exports.register = function(am) {
  var cmd = am.cli.command('init')
    .description('initialize package')
    .option('--name <name>', 'arg name')
    .option('--version <version>', 'arg version')
    .option('--desc <desc>', 'arg desc')
    .option('--author <author>', 'arg author')
    .option('--license <license>', 'arg license')
    .action(function(baseDir) {
      if (arguments.length <= 1) {
        baseDir =  am.config.pwd;
      }
      baseDir = path.resolve(baseDir);
      mkdirp.sync(baseDir);

      am.logInfo(cmd.description());

      if (fs.existsSync(path.join(baseDir, 'package.json'))) {
        am.logError('package is exist.');
        return process.exit(1);
      }

      var _name = path.basename(path.resolve('.'));
      var def = {
        'name': _name,
        'group': 'id.co.xinix',
        'version': '0.0.1',
        'desc': 'project ' + _name,
        'author': 'anonim <someone@example.net>',
        'license': 'XINIX'
      };

      async.waterfall([
        am.customOption(cmd, 'name', def),
        am.customOption(cmd, 'group', def),
        am.customOption(cmd, 'version', def),
        am.customOption(cmd, 'desc', def),
        am.customOption(cmd, 'author', def),
        am.customOption(cmd, 'license', def)
      ], function(cb) {
        data = JSON.stringify(am.options, null, 2);
        fs.writeFileSync(path.join(baseDir, 'package.json'), data, 'utf8');

        process.stdin.destroy();
        console.log();
      });
    });
};
