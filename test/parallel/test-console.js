'use strict';
var common = require('../common');
var assert = require('assert');

assert.ok(process.stdout.writable);
assert.ok(process.stderr.writable);
// Support legacy API
assert.equal('number', typeof process.stdout.fd);
assert.equal('number', typeof process.stderr.fd);

assert.throws(function() {
  console.timeEnd('no such label');
});

assert.doesNotThrow(function() {
  console.time('label');
  console.timeEnd('label');
});

// an Object with a custom .inspect() function
var custom_inspect = { foo: 'bar', inspect: function() { return 'inspect'; } };

var stdout_write = global.process.stdout.write;
var strings = [];
global.process.stdout.write = function(string) {
  strings.push(string);
};
console._stderr = process.stdout;

// test console.log()
console.log('foo');
console.log('foo', 'bar');
console.log('%s %s', 'foo', 'bar', 'hop');
console.log({slashes: '\\\\'});
console.log(custom_inspect);

// test console.dir()
console.dir(custom_inspect);
console.dir(custom_inspect, { showHidden: false });
console.dir({ foo : { bar : { baz : true } } }, { depth: 0 });
console.dir({ foo : { bar : { baz : true } } }, { depth: 1 });

// test console.trace()
console.trace('This is a %j %d', { formatted: 'trace' }, 10, 'foo');

// test console.time() and console.timeEnd() output
console.time('label');
console.timeEnd('label');
console.time('label %s');
console.timeEnd('label %s', 'hello');
console.time('label %s %s');
console.timeEnd('label %s %s', 'hello', 'world');

// verify that Object.prototype properties can be used as labels
console.time('__proto__');
console.timeEnd('__proto__');
console.time('constructor');
console.timeEnd('constructor');
console.time('hasOwnProperty');
console.timeEnd('hasOwnProperty');

global.process.stdout.write = stdout_write;

assert.equal('foo\n', strings.shift());
assert.equal('foo bar\n', strings.shift());
assert.equal('foo bar hop\n', strings.shift());
assert.equal("{ slashes: '\\\\\\\\' }\n", strings.shift());
assert.equal('inspect\n', strings.shift());
assert.equal("{ foo: 'bar', inspect: [Function] }\n", strings.shift());
assert.equal("{ foo: 'bar', inspect: [Function] }\n", strings.shift());
assert.notEqual(-1, strings.shift().indexOf('foo: [Object]'));
assert.equal(-1, strings.shift().indexOf('baz'));
assert.equal('Trace: This is a {"formatted":"trace"} 10 foo',
             strings.shift().split('\n').shift());
assert.ok(/^label: \d+\.\d{3}ms$/.test(strings.shift().trim()));
assert.ok(/^label hello: \d+\.\d{3}ms\n/.test(strings.shift()),
          'timeEnd with one extra arg');
assert.ok(/^label hello world: \d+\.\d{3}ms\n/.test(strings.shift()),
          'timeEnd with more than one extra arg');
assert.ok(/^__proto__: \d+\.\d{3}ms$/.test(strings.shift().trim()));
assert.ok(/^constructor: \d+\.\d{3}ms$/.test(strings.shift().trim()));
assert.ok(/^hasOwnProperty: \d+\.\d{3}ms$/.test(strings.shift().trim()));
assert.equal(strings.length, 0);
