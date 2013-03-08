var utilf = require('../utils/file');

exports.register = function(am) {
  var cmd = am.cli.command('install <package> [to]')
    .description('install package')
    .option('-s, --standalone', 'standalone installation')
    .action(function(package, to) {
      var dest = new am.AM.Package(am, to);
      if (dest.isPackage() && !cmd.standalone) {
        am.logError('Cannot install to ' + dest.cwd);
        process.exit(1);
      }
      to = dest.cwd;


      am.cache.fetch(package, true);
      am.cache.copy(package, to, true);
    });

};