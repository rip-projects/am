var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

function customOption(cmd, k, def) {
  return function(cb) {
    var cli = cmd.parent;
    if (!cli.force && !cmd[k]) {
      cmd.prompt(' * ' + k + ': (' + def[k] + ') ', function(value) {
        cmd[k] = value || def[k];
        return cb();
      });
    } else {
      cmd[k] = cmd[k] || def[k];
      return cb();
    }
  };
}

exports.register = function(cli) {
  cli.command('init')
    .description('initialize package')
    .option('--name <name>', 'arg name')
    .option('--version <version>', 'arg version')
    .option('--desc <desc>', 'arg desc')
    .option('--author <author>', 'arg author')
    .option('--license <license>', 'arg license')
    .action(function(baseDir) {
      var cmd = arguments[arguments.length-1];
      if (arguments.length <= 1) {
        baseDir =  '.';
      }
      baseDir = path.resolve(baseDir);
      mkdirp(baseDir);

      cmd.logInfo(cmd.description());

      if (fs.existsSync(path.join(baseDir, 'package.json'))) {
        cmd.logError('package is exist.');
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
        customOption(cmd, 'name', def),
        customOption(cmd, 'group', def),
        customOption(cmd, 'version', def),
        customOption(cmd, 'desc', def),
        customOption(cmd, 'author', def),
        customOption(cmd, 'license', def)
      ], function(cb) {
        var data = {};
        if (cmd.name) {
          data.name = cmd.name;
        }
        if (cmd.group) {
          data.group = cmd.group;
        }
        if (data.version) {
          cmd.version = cmd.version;
        }
        if (cmd.desc) {
          data.desc = cmd.desc;
        }
        if (cmd.author) {
          data.author = cmd.author;
        }
        if (cmd.license) {
          data.license = cmd.license;
        }

        data = JSON.stringify(data, null, 2);
        fs.writeFileSync(path.join(baseDir, 'package.json'), data, 'utf8');

        console.log();
        console.log('done');
        process.exit(0);
      });
    });
};
