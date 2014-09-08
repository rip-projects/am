var utilf = require('../utils/file'),
    Package = require('../utils/package'),
    Config = require('../modules/config'),
    Repo = require('../utils/repo');

exports.register = function(am) {
  var cmd = am.cli.command('install [package] [to]')
    .description('install package')
    .option('-s, --standalone', 'standalone installation')
    .option('-d, --dev', 'development mode')
    .action(function(pUrl, to) {
      if (Config.getInstance().ispackage && !to) {
        am.logInfo('Installing package as library');
      } else {
        am.logInfo('Installing package as standalone');
      }

      if (!pUrl) {
        am.logError('Unimplemented yet');
        process.exit(1);
      } else {
        var repo = Repo.factory(pUrl, cmd.dev);
        repo.fetch(function(err, from) {
          if (err) {
            am.logError('Error on fetch ' + repo.url.url);
            process.exit(1);
            return;
          }
          if (Config.getInstance().ispackage && !to) {
            repo.install(from);
          } else {
            repo.installStandalone(from, to);
          }
        });
      }
    });
};