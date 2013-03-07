var fs = require('fs'),
    path = require('path'),
    cli = require('commander'),
    colors = require('colors');

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

function modifyCLI(cli) {
  cli.Command.prototype.commandHelp = function(){
    if (!this.commands.length) return '';
    return [
      '',
      '  Commands:',
      '',
      this.commands.map(function(cmd){
        if (cmd._name == '*') return '';
        var args = cmd._args.map(function(arg){
          return arg.required ? '<' + arg.name + '>'
            : '[' + arg.name + ']';
        }).join(' ');

        return pad(cmd._name + (cmd.options.length ? ' [options]'
            : '') + ' ' + args, 22) + (cmd.description() ? ' ' + cmd.description()
            : '');
      }).join('\n').replace(/^/gm, '    '),
      ''
    ].join('\n');
  };


  cli.Command.prototype.logError = function() {
    var args = ['ERR:'.red.bold];
    for(var i in arguments) {
      args.push(arguments[i]);
    }
    console.error.apply(console, args);
  };

  cli.Command.prototype.logInfo = function() {
    var args = [];
    for(var i in arguments) {
      args.push(arguments[i].green.bold);
    }
    console.error.apply(console, args);
  };
}


function prepareOptions(cli) {
  cli.version('0.0.1')
    .option('-f,--force', 'force to do action');
    // .option('-f,--force', 'force to do action')
    // .option('-g, --global', 'set global mode on')
}

function prepareModules(cli) {
  var moduleDir = path.join(__dirname, '/modules');
  var files = fs.readdirSync(moduleDir);

  files.forEach(function(file) {
    require(path.join(moduleDir, file.split('.')[0])).register(cli);
  });

  cli.command('*')
    .action(function(env){
      cli.outputHelp();
      process.exit(1);
    });
}

function runCli(cli) {
  cli.parse(process.argv);
}

exports.version = '0.0.1';
exports.cli = function() {
  modifyCLI(cli);
  prepareOptions(cli);
  prepareModules(cli);
  runCli(cli);

};
