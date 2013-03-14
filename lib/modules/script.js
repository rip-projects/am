var AM = require('../am'),
    Package = require('../utils/package'),
    exec = require('child_process').exec,
    Config = require('../modules/config');

var Script = function() {
  this.package = new Package();
};


Script.prototype.run = function(scriptSrc, arg, cb) {
  var that = this;

  if (arguments.length == 2 && typeof arg == 'function')  {
    cb = arg;
    arg = [];
  }

  var fn = function() {
    script = (that.package.data.arkScripts) ? that.package.data.arkScripts[scriptSrc] : null;
    if (script) {
      var s = script + " " + arg.join(' ');
      console.log('RUN: ' + s);
      var env = process.env;
      env.AM_CONFIG = JSON.stringify(Config.getInstance(), null, 2);
      env.AM_PACKAGE = JSON.stringify(that.package.data);

      var proc = exec('cd ' + that.package.cwd + ' && ' + s, {
          'env': env
        },function(err, stdout, stderr) {
        if (cb) return cb();
      });
      proc.stdout.on('data', function (data) {
        data = data.trim();
        console.log('SCRIPT'.green, data);
      });

      proc.stderr.on('data', function (data) {
        data = data.trim();
        console.log('SCRIPT'.yellow, data);
      });
    } else {
      if (cb) cb();
      // AM.instance.logError('No script available [' + scriptSrc + ']');
      // process.exit(1);
    }
  };

  if (scriptSrc == 'install' && this.package.data.dependencies) {
    console.log('RUN: npm install');
    var proc = exec('cd ' + this.package.cwd + ' && npm install', fn);
    proc.stdout.on('data', function (data) {
      data = data.trim().split('\n');
      for(var i in data) {
        if (data[i]) console.log('NPM'.green, data[i]);
      }
    });

    proc.stderr.on('data', function (data) {
      // data = data.trim();
      // if (data.substr(0,3) == 'npm' || data.substr(0, 4) == 'http' || data == 'GET' || data == '200') return;
      // console.log('NPM'.yellow, data);
    });
  } else {
    fn();
  }

};

Script.instance = null;
Script.getInstance = function() {
  if (!Script.instance) {
    Script.instance = new Script();
  }
  return Script.instance;
};

Script.register = function(am) {
  var cmd = am.cli.command('script')
    .description('run script')
    .action(function(script) {
      var i;
      if (script == cmd) {
        var scr = Config.getInstance().package.arkScripts;
        for(i in scr) {
          console.log(i);
        }
        process.exit();
      }
      var arg = [];
      for(i in arguments) {
        arg.push(arguments[i]);
      }
      Script.getInstance().run(script, arg.splice(1, arg.length-2));
    });
};

exports = module.exports = Script;