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

var assertionText = {
  Flood: 'should resolve in whatever order results come back in',
  Relay: 'should resolve in the order values are pushed'
};

function identity(x) {
  return x;
}

// Given some resolution order, determine the length of a relay at each
// execution step. The relay should grow by one on a step where the next index
// to resolve either resolved on this step or had previously resolved.
function expectedRelayLengths(resolutionOrder) {
  // Initially, the relay has no length.
  var currentRelayLength = 0;
  // Initially, no indexes have resolved, but not been added to the relay
  var resolvedIndexesNotAddedToTheRelay = [];
  // Map over the resolution order, obtaining an array of expected relay lengths
  // at each resolution step.
  return resolutionOrder.map(function(justResolved) {
    // Include the index that just resolved among the resolved indexes.
    resolvedIndexesNotAddedToTheRelay.push(justResolved);
    // Sort the resolved indexes so that the smallest is first.
    resolvedIndexesNotAddedToTheRelay.sort();
    // If the smallest resolved index is the current relay length, it is the
    // next index of an element to add to the relay.
    if (resolvedIndexesNotAddedToTheRelay[0] === currentRelayLength) {
      // Remove this minimum index from the list of resolved indexes not added
      // to the relay.
      resolvedIndexesNotAddedToTheRelay.shift();
      // Increment the current relay length by one to indicate that the element
      // at that index was added to the relay.
      currentRelayLength++;
    }
    // Return the current relay length.
    return currentRelayLength;
  });
}

// Given some resolution order, determine the length of a flood at each
// execution step. The flood should simply grow by one at each resolution step.
function expectedFloodLengths(resolutionOrder) {
  var currentFloodLength = 0;
  return resolutionOrder.map(function(justResolved) {
    return ++currentFloodLength;
  });
}

// Taken from CoolAJ86's stackoverflow response retrieved on 2015-07-07 at:
//  http://stackoverflow.com/questions/2450954/
//  how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function generateRandomResolutionOrders(indexes, num) {
  var orders = [];
  while (num-- > 0)
    orders.push(shuffle(indexes.slice(0)));
  return orders;
}


function testResolution(ctor, indexes, resolutionOrder) {
  // Determine the function to use to calculate the expected lengths.
  var lenFn = ctor === Flood ? expectedFloodLengths : expectedRelayLengths;
  // The expected length of the list after each resolution of an index.
  var expectedLengths = lenFn(resolutionOrder);
  // Expect the final results to be the resolution order for a Flood and the
  // index order for a Relay.
  var expectedRes = ctor === Flood ? resolutionOrder : indexes;

  // Keep an array of promises and their resolve functions.
  var promises = [];
  var resolves = [];
  // Create a list of promises.
  var list = new ctor();
  indexes.forEach(function(ix) {
    promises[ix] = new Promise(function(resolve) {
      resolves[ix] = resolve;
    });
    list.push(promises[ix]);
  });
  // End the list.
  list.end();

  // Resolves a promise with an index and returns it.
  function res(ix) {
    resolves[ix](ix);
    return promises[ix];
  }

  // Map the list with the identity function
  var mappedList = list.map(identity);
  // Keep a running promise.
  var runningPromise = Promise.resolve();

  // Resolve promises in the specified resolution order.
  resolutionOrder.forEach(function(indexToResolve, resolutionStep) {
    var prior = runningPromise;
    runningPromise = Promise.resolve().then(function() {
      // Resolve the previous running promise.
      return prior;
    }).then(function() {
      // Resolve and return the index to resolve.
      return res(indexToResolve);
    }).then(function() {
      // Expect the mappedList to not have a length determined by the
      // constructor and the current resolution step.
      return mappedList.should.have.length(expectedLengths[resolutionStep]);
    });
  });

  // Ensure that the mapped list has the correct value
  return runningPromise.then(function() {
    return mappedList.value().should.eventually.become(expectedRes);
  });
}

function testLaterList(ctor, indexes, resolutionOrders) {
  var assertion = assertionText[ctor.name];
  describe(ctor.name, function() {
    it(assertion, function() {
      // Test each resolution order.
      resolutionOrders.forEach(function(resolutionOrder) {
        testResolution(ctor, indexes, resolutionOrder);
      });
    });
  });
}

describe('Resolution Order', function() {
  var indexes = [0,1,2,3,4,5,6,7,8,9];
  // Generate 100 random resolution orders for the given indexes. Flood and
  // Relay are tested over the same resolution orders.
  var resolutionOrders = generateRandomResolutionOrders(indexes, 100);
  [Flood, Relay].forEach(function(ctor) {
    describe(ctor.name, function() {
      return testLaterList(ctor, indexes, resolutionOrders);
    });
  });
});
