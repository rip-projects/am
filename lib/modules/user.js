var Config = require('./config.js'),
    async = require('async'),
    AM = require('../am');

var User = function() {

};

User.prototype.whoami = function() {
  return Config.getInstance().user;
};

User.prototype.add = function(body, cb) {
  AM.instance.req({
      uri: 'user/add',
      body: body
    }, function(err, data) {
      if (!err) {
        Config.getInstance().set('user', data);
      }
      cb(err, data);
    });

};

User.instance = null;
User.getInstance = function() {
  if (User.instance === null) {
    User.instance = new User();
  }
  return User.instance;
};

User.register = function(am) {
  var cmd = am.cli.command('user')
    .description('User management')
    .action(function(a) {
      if (a == cmd) {
        var user = User.getInstance().whoami();
        if (!user) {
          console.log('no user available or not login yet');
        } else {
          console.log(user.username);
        }
        process.exit();
      }
      am.defaultAction.apply(this, arguments);
    });

  cmd.command('add')
    .description('add user')
    .action(function(subc) {
      var def = {
        username: process.env.USER,
        password: '',
        email: ''
      };
      async.waterfall([
        am.customOption(cmd, 'username', def),
        am.customOption(cmd, 'password', def),
        am.customOption(cmd, 'email', def)
      ], function(cb) {
        process.stdin.destroy();

        User.getInstance().add(am.options, function(err, data) {
          if (err) return console.log('Error on add user');
          console.log('DONE');
        });
      });
    });
};

exports = module.exports = User;