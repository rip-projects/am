var utilf = require('../utils/file');

exports.register = function(am) {
  var cmd = am.cli.command('install [package] [to]')
    .description('install package')
    .option('-s, --standalone', 'standalone installation')
    .action(function(pUrl, to) {
      am.logInfo(cmd.description());

      var fn = function(err, pkg) {
        am.cache.install(pkg, to, function(err) {
          am.script.run(pkg, 'install', function(err) {
            console.log();
          });
        });
      };

      var dest = new am.AM.Package(am, to);
      to = dest.cwd;

      if (dest.isPackage()) {
        fn();
      } else {
        am.cache.fetch(pUrl, fn);
      }

    });

};