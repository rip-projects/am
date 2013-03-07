var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    assert = require('assert');
// var spawn = require('child_process').spawn;

function fnIterator(o, next) {
  var tests = require(path.join(moduleDir, o.split('.')[0]));
  var tArr = [];
  for(var i in tests) {
    tArr.push({
      'key': i,
      'fn': tests[i]
    });
  }
  async.eachSeries(tArr, function(o1, next1) {
    o1.fn(function(err) {
      console.log('|', o1.key);
      next1(err);
    });
  }, function(err) {
    next(err);
  });
}

function fnResult(err, result) {
  assert.ifError(err);
  console.log('DONE');
}

var moduleDir = path.join(__dirname, 'modules');
var files = fs.readdirSync(moduleDir);
async.eachSeries(files, fnIterator, fnResult);

