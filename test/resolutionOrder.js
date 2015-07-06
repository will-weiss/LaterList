/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require("sinon"),
  sinonChai = require("sinon-chai"),
  u = require('../lib/utils'),
  Relay = require('../lib/Relay'),
  Flood = require('../lib/Flood');

var should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

if (!global.Promise)
  global.Promise = require('bluebird').Promise;

function identity(x) {
  return x;
};

function testLaterList(ctor) {
  describe(ctor.name, function() {
    it(ctor === Flood ? 'should resolve in whatever order results come back ' +
      'in' : 'should resolve in the order values are pushed', function() {

      var indexes = [0,1,2,3,4];
      var resolveOrder = [2,1,0,4,3];
      var expectedLen = ctor === Flood ? [0,1,2,3,4] : [0,0,0,1,2]
      var expectedRes = ctor === Flood ? resolveOrder : indexes;
      var promises = [];
      var resolves = [];

      // Create a list of promises
      var list = new ctor();
      indexes.forEach(function(ix) {
        promises[ix] = new Promise(function(resolve) {
          resolves[ix] = resolve;
        });
        list.push(promises[ix]);
      });

      list.end();

      // Resolve a promise with an index and return it.
      function res(ix) {
        resolves[ix](ix);
        return promises[ix];
      }

      // Map the list with the identity function
      var mappedList = list.map(identity);
      mappedList.should.have.length(0);
      mappedList._state.ended.should.equal(false);

      // Keep a running promise
      var runningPromise = Promise.resolve();

      // Resolve promises in the proper resolveOrder
      resolveOrder.forEach(function(indexToResolve, order) {
        var prior = runningPromise;
        runningPromise = Promise.resolve().then(function() {
          return prior;
        }).then(function() {
          mappedList.should.have.length(expectedLen[order]);
          return res(indexToResolve);
        });
      });

      // Ensure that the mapped list has the correct value
      return runningPromise.then(function() {
        return mappedList.value().should.eventually.become(expectedRes);
      });

    });
  });
}

describe('Resolution Order', function() {
  [Flood, Relay].forEach(function(ctor) {
    describe(ctor.name, function() {
      return testLaterList(ctor);
    });
  });
});
