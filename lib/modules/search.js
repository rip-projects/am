var sprintf = require('sprintf').sprintf;

var Search = function() {

};

Search.register = function(am) {
  var cmd = am.cli.command('search')
    .description('Search the package')
    .action(function(name) {
      if (name == cmd) {
        name = '';
      }
      am.req({
        uri: 'repo/entries',
        form: { q: name }
      }, function(err, data) {
        for (var i in data.entries) {
          var r = data.entries[i];
          console.log(sprintf('%-30s', r.group + ':' + r.name),  sprintf('%-10s', r.version));
        }
      });
    });
};

Search.instance = null;
Search.getInstance = function() {
  if (!Search.instance) {
    Search.instance = new Search();
  }
  return Search.instance;
};

exports = module.exports = Search;