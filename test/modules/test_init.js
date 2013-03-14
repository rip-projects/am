var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

exports['init new package anonimously'] = function(cb) {
  exec('rm -fr ./tmp; mkdir -p ./tmp; cd ./tmp && ../bin/am init -f', function(err, stdout, stderr) {
    clearTimeout(timeout);
    assert(fs.existsSync(path.join('./tmp/package.json')), 'Init failed');
    cb();
  });
  var timeout = setTimeout(function() {
    cb(new Error('Timeout'));
  }, 1000);
};

// exports['init with available dir path'] = function(cb) {
//   cb();
// };

// exports['init without unavailable dir path'] = function(cb) {
//   // console.log('uuuu');
//   cb();
// };