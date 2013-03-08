var fs = require('fs'),
    path = require('path'),
    cli = require('commander'),
    colors = require('colors');

var AM = function(cli) {
  this.AM = AM;
  this.cli = cli;
  this.options = {};
  this.config = new AM.Config(this);
  this.cache = new AM.Cache(this);
  this._modifyCLI();
  this._prepareOptions();
  this._prepareModules();
};

AM.Config = require('./am-config');
AM.Package = require('./am-package');
AM.Cache = require('./am-cache');

AM.prototype.customOption = function(cmd, k, def) {
  var that = this;
  return function(cb) {
    var cli = cmd.parent;
    if (!cli.force && !cmd[k]) {
      cmd.prompt(' * ' + k + ': (' + def[k] + ') ', function(value) {
        that.options[k] = value || def[k];
        return cb();
      });
    } else {
      that.options[k] = that.options[k] || def[k];
      return cb();
    }
  };
};


AM.prototype.defaultAction = function(subc) {
  var cmd = arguments[arguments.length - 1];
  if (cmd.listeners(subc).length) {
    var args = [];
    var name = arguments[0];
    if (arguments.length > 1) {
      for(var i = 1; i < arguments.length - 1; i++) {
        args.push(arguments[i]);
      }
    }
    cmd.emit(subc, args);
  } else {
    cmd.outputHelp();
    process.exit(1);
  }
};

AM.prototype.run = function() {
  this.cli.parse(process.argv);
};

AM.prototype._prepareModules = function() {
  var that = this;
  var moduleDir = path.join(__dirname, '/modules');
  var files = fs.readdirSync(moduleDir);

  files.forEach(function(file) {
    require(path.join(moduleDir, file.split('.')[0])).register(that);
  });

  this.cli.command('*')
    .action(function(env){
      that.cli.outputHelp();
      process.exit(1);
    });
};

AM.prototype._prepareOptions = function() {
  cli = this.cli;
  cli.version('0.0.1')
    .option('-f,--force', 'force to do action');
    // .option('-f,--force', 'force to do action')
    // .option('-g, --global', 'set global mode on')
};

AM.prototype._modifyCLI = function() {
  cli = this.cli;
  cli.Command.prototype.commandHelp = function(){
    function pad(str, width) {
      var len = Math.max(0, width - str.length);
      return str + Array(len + 1).join(' ');
    }

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
};

AM.prototype.logError = function() {
  var args = ['ERR:'.red.bold];
  for(var i in arguments) {
    args.push(arguments[i]);
  }
  console.error.apply(console, args);
};

AM.prototype.logInfo = function() {
  var args = [];
  for(var i in arguments) {
    args.push(arguments[i].green.bold);
  }
  console.error.apply(console, args);
};

exports.AM = AM;
exports.version = '0.0.1';
exports.cli = function() {
  var am = new AM(cli);
  am.run();
};
