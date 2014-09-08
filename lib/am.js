var fs = require('fs'),
    path = require('path'),
    cli = require('commander'),
    colors = require('colors'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    request = require('request'),
    Config = require('./modules/config.js'),
    querystring = require('querystring'),
    crypto = require('crypto');

require('shelljs/global');

var AM = function(cli) {
  var that = this;
  this.cli = cli;
  this.options = {};
  this._modifyCLI();
  this._prepareOptions();
  this._prepareModules();

  var npmconf = require('npmconf');
  npmconf.load({some:'configs'}, function (er, conf) {
    that.npmConf = conf;
    that.emit('run');
  });

};

// AM.Config = require('./am-config');
// AM.Package = require('./am-package');
// AM.Cache = require('./am-cache');
// AM.Script = require('./am-script');

util.inherits(AM, EventEmitter);

AM.prototype.customOption = function(cmd, k, def) {
  var that = this;
  return function(cb) {
    var cli = cmd.parent;
    if (!cli.force && (!cmd[k] || typeof(cmd[k]) == 'function')) {
      if (k == 'password') {
        cmd.password(' * ' + k + ': ', function(value) {
          that.options[k] = value || def[k];
          return cb();
        });
      } else {
        cmd.prompt(' * ' + k + ': (' + def[k] + ') ', function(value) {
          that.options[k] = value || def[k];
          return cb();
        });
      }
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
  var that = this;
  this.on('run', function() {
    that.cli.parse(process.argv);
  });
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

AM.prototype.dl = function(options, cb) {
  var registry = Config.getInstance().registry;
  if (typeof options == 'string') {
    options = {
      uri: options
    };
  }

  options.uri = registry + options.uri + '.json';
  options.headers = {'content-type' : 'application/x-www-form-urlencoded'};
  options.method = 'POST';
  options.followAllRedirects = true;

  var tmp = Config.getInstance();
  tmp = path.resolve(path.join(tmp.cache, '../tmp'));

  mkdir('-p', tmp);
  var unique = false;
  var t;
  do {
    t = crypto.createHash('sha1').update(new Date() + (Math.random() * 1000)).digest('hex').substr(-5);
    unique = !fs.existsSync(path.join(tmp, t));
  } while(!unique);

  request(options, function (err, resp) {
    if (!err && resp.statusCode == 200) {
      process.nextTick(function() {
        cb(null, path.join(tmp, t));
      });
    } else {
      return cb && cb(err || { statusCode: resp.statusCode, body: body });
    }
  }).pipe(fs.createWriteStream(path.join(tmp, t)));
};

AM.prototype.req = function(options, cb) {
  var registry = Config.getInstance().registry;
  if (typeof options == 'string') {
    options = {
      uri: options
    };
  }

  options.uri = registry + options.uri + '.json';
  // options.body = querystring.stringify(options.body);
  options.headers = {'content-type' : 'application/x-www-form-urlencoded'};
  options.method = 'POST';
  options.followAllRedirects = true;
  // console.log(options);
  request(options, function (err, resp, body) {
    if (!err && resp.statusCode == 200) {
      switch(resp.headers['content-type']) {
        case 'application/json':
          body = JSON.parse(body);
          break;
      }
      if (body && body.error) {
        cb(body.error);
      } else {
        cb(null, body);
      }
    } else {
      return cb && cb(err || { statusCode: resp.statusCode, body: body });
    }
  });
};


AM.version = '0.0.1';

AM.instance = null;
AM.cli = function() {
  AM.instance = new AM(cli);
  AM.instance.run();
};

// AM.require = function() {
//   return require.apply(null, arguments);
// };

exports = module.exports = AM;
