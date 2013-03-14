var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

exports['config list on package'] = function(cb) {
  exec('rm -fr ./tmp; mkdir -p ./tmp; cd ./tmp && ../bin/am init -f && ../bin/am config list -p', function(err, stdout, stderr) {
    clearTimeout(timeout);
    assert(JSON.parse(stdout).ispackage, 'Cannot detect on package');
    cb();
  });
  var timeout = setTimeout(function() {
    cb(new Error('Timeout'));
  }, 1000);
};

exports['config list off package'] = function(cb) {
  exec('rm -fr ./tmp; mkdir -p ./tmp; cd ./tmp && ../bin/am config list -p', function(err, stdout, stderr) {
    clearTimeout(timeout);
    assert(!JSON.parse(stdout).ispackage, 'Cannot detect off package');
    cb();
  });
  var timeout = setTimeout(function() {
    cb(new Error('Timeout'));
  }, 1000);
};