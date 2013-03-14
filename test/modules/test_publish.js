var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

exports['am publish --dev (publish dev)'] = function(cb) {
  exec('rm -fr ./tmp; mkdir -p ./tmp; cd ./tmp && ../bin/am init -f && ../bin/am publish -d', function(err, stdout, stderr) {
    clearTimeout(timeout);
    if (err) {
      assert.ifError(err);
      process.exit(1);
    }
    cb();
  });
  var timeout = setTimeout(function() {
    cb(new Error('Timeout'));
  }, 1000);
};


exports['am publish -r (unpublish)'] = function(cb) {
  exec('rm -fr ./tmp; mkdir -p ./tmp; cd ./tmp && ../bin/am init -f && ../bin/am publish -r', function(err, stdout, stderr) {
    clearTimeout(timeout);
    if (err) {
      assert.ifError(err);
      process.exit(1);
    }
    cb();
  });
  var timeout = setTimeout(function() {
    cb(new Error('Timeout'));
  }, 2000);
};