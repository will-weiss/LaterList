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

function delay(result) {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(Promise, result), 0);
  });
}

function add(a, b) {
  return delay(a + b);
}

function isOdd(n) {
  return delay(n % 2 === 1);
}

function or(left, right) {
  return delay(left || right);
}

function testHead(list, desired) {
  var head = list._headRef.next;
  desired.forEach(function(value, index) {
    var count = index,
      ref = head;
    while (count-- > 0)
      ref = ref.next;
    ref.value.should.equal(value);
  });
}

function testTail(list, desired) {
  var tail = list._tail;
  var lastIx = desired.length - 1;
  var lastVal = desired[lastIx];
  tail.value.should.equal(lastVal);
}

var laterListCtors = [Relay, Flood];

var assertions = {

  length: function(ctor) {
    it('should initially be zero', function() {
      return (new ctor()).should.have.length(0);
    });
  },

  push: function(ctor) {
    var list = new ctor();
    var desired = [1,2,3,4,5];
    it('should update and respond with the length', function() {
      list.should.have.length(0);
      list.push(1,2,3).should.equal(3);
      list.should.have.length(3);
      list.push(4,5).should.equal(5);
      list.should.have.length(5);
    });
    it('should update the head', function() {
      return testHead(list, desired);
    });
    it('should update the tail', function() {
      return testTail(list, desired);
    });
  },

  atIndex: function(ctor) {
    it('should get the current value at an index or undefined if there is no ' +
      'value at that index', function() {
        var list = new ctor();
        list.push(1,2,3);
        should.not.exist(list.atIndex(-1));
        list.atIndex(0).should.equal(1);
        list.atIndex(1).should.equal(2);
        list.atIndex(2).should.equal(3);
        should.not.exist(list.atIndex(3));
    });
  },

  end: function(ctor) {
    it('should set the list\'s state to ended', function() {
      var list = new ctor();
      list._state.ended.should.equal(false);
      list.push(1,2,3);
      list._state.ended.should.equal(false);
      list.end();
      list._state.ended.should.equal(true);
    });
    it('should remove the reference to the tail', function() {
      var list = new ctor();
      should.exist(list._tail);
      list.push(1,2,3);
      should.exist(list._tail);
      list.end();
      should.not.exist(list._tail);
    });
    it('should not set the list\'s error if called no arguments', function() {
      var list = new ctor();
      should.not.exist(list._state.error);
      list.end();
      should.not.exist(list._state.error);
    });
    it('should set the list\'s error if called an argument', function() {
      var list = new ctor();
      var err = new Error();
      should.not.exist(list._state.error);
      list.end(err);
      list._state.error.should.equal(err);
    });
  },

  consume: function(ctor) {
    var list = new ctor();
    list.push(1,2,3,4);
    list.end();
    it('should resolve with the value of the listener when there is ' +
      'no error', function() {
        return list.consume(u.noop, 5).should.eventually.become(5);
    });
    it('should reject when an error is thrown', function() {
      var callCount = 0;
      function throwOnThird() {
        if (++callCount === 3)
          throw new Error();
      }
      return list.consume(throwOnThird, 5).should.eventually.be.rejected;
    });
  },

  value: function(ctor) {
    it('should resolve with its values as an array', function() {
      var list = new ctor();
      list.push(1,2,3);
      list.end();
      return list.value().should.eventually.deep.equal([1,2,3]);
    });
  },

  from: function(ctor) {
    // Tests construction of a LaterList from a given constructor
    function testConstructingFrom(testCtor) {
      // When constructing from an Array expect the resulting LaterList to be
      // ended immediately, but not if constructing from a LaterList.
      var expectImmediateEnd   = testCtor === Array;
      // LaterLists need to be explicitly ended, Arrays do not.
      var endListLikeNecessary = testCtor !== Array;
      // Verifies that the list constructed has a value of the desired list.
      function verifyList(listLike, list, desired) {
        list.should.be.an.instanceof(ctor);
        list._state.ended.should.equal(expectImmediateEnd);
        if (endListLikeNecessary)
          listLike.end();
        return list.value().then(function(arr) {
          arr.should.deep.equal(desired);
          return list._state.ended.should.equal(true);
        });
      }
      it('should create a new ' + ctor.name + ' from a supplied ' +
        testCtor.name, function() {
          var listLike = new testCtor();
          listLike.push(1,2,3);
          var list = ctor.from(listLike);
          return verifyList(listLike, list, [1,2,3]);
      });
      it('should apply a map function over a context if supplied', function() {
        function doubleAndAddContextNum(n) {
          return delay(2 * n + this.num);
        }
        var listLike = new testCtor();
        listLike.push(1,2,3);
        var list = ctor.from(listLike, doubleAndAddContextNum, {num: 3});
        return verifyList(listLike, list, [5,7,9]);
      });
    }
    // Test constructing LaterLists from other LaterLists and Arrays.
    laterListCtors.concat(Array).forEach(testConstructingFrom);
  },

  of: function(ctor) {
    it('should create a new ended ' + ctor.name + ' from the supplied ' +
      ' arguments', function() {
      var list = ctor.of(1,2,3);
      list._state.ended.should.equal(true);
      return list.value().should.eventually.deep.equal([1,2,3]);
    });
  },

  when: function(ctor) {
    it('should resolve with undefined when the list ends with no ' +
      'error', function() {
        return ctor.from([]).when().should.eventually.become(undefined);
    });
    it('should return identical promises when called more than once',
      function() {
        var list = ctor.from([]);
        return list.when().should.equal(list.when());
    });
    it('should reject with the error of a list', function() {
      var list = new ctor();
      list.end(new Error());
      return list.when().should.eventually.be.rejected;
    });
  },

  close: function(ctor) {
    var list = ctor.from([1,2,3]);
    it('should remove the reference to the head of the list', function() {
      should.exist(list._headRef);
      list.close();
      should.not.exist(list._headRef);
    });
    it('should cause methods that rely on the head of the list to throw',
      function() {
        list.addListener.should.throw();
        list.close.should.throw();
        list.atIndex.should.throw();
    });
  },

  link: function(ctor) {
    it('should add a listener whose value is a new list', function() {
      var list = ctor.from([1,2,3]);
      addListenerSpy = sinon.spy(list, 'addListener');
      addListenerSpy.callCount.should.equal(0);
      var newList = list.link(u.noop);
      newList.should.be.an.instanceof(ctor);
      addListenerSpy.callCount.should.equal(1);
      var args = addListenerSpy.firstCall.args;
      args.should.have.length(3);
      args[0].should.equal(u.noop);
      args[1].should.equal(newList.end);
      args[2].should.equal(newList);
    });
    it('should pass along errors from the original list', function() {
      var list = new ctor();
      list.push(1,2,3);
      var err = new Error();
      list.end(err);
      var newList = list.link(u.noop);
      return newList._state.error.should.equal(err);
    });
  },

  concat: function(ctor) {
    var desired = [1,2,3,4,5,6,7,8,9,['nest']];
    var cat = ctor.from([1,2])
      .concat([3,4], 5, Relay.from([6,7]), Flood.from([8,9]), [['nest']]);
    it('should return a new ' + ctor.name, function() {
      return cat.should.be.an.instanceof(ctor);
    });
    it('should concatenate correctly', function() {
      return cat.value().then(function(arr) {
        if (ctor === Flood) {
          arr.should.not.deep.equal(desired);
          arr.sort();
        }
        return arr.should.deep.equal(desired);
      });
    });
  },

  every: function(ctor) {
    it('should resolve with true when predicates are vacuously ' +
      'true', function() {
      return ctor.from([]).every(isOdd).should.eventually.become(true);
    });
    it('should resolve with true when every predicate is ' +
      'true', function() {
      return ctor.from([1,3,5]).every(isOdd).should.eventually.become(true);
    });
    it('should resolve with false when there is some ' +
      'false predicate', function() {
      return ctor.from([1,3,4]).every(isOdd).should.eventually.become(false);
    });
  },

  filter: function(ctor) {
    it('should filter elements by a predicate', function() {
      return ctor.from([2,5,6]).filter(isOdd)
        .value().should.eventually.deep.equal([5]);
    });
  },

  find: function(ctor) {
    it('should resolve undefined if no element satisfies the ' +
      'predicate', function() {
      return ctor.from([2,4,6]).find(isOdd).should.eventually.become(undefined);
    });
    it('should find a elements by a predicate', function() {
      return ctor.from([2,5,6]).find(isOdd).should.eventually.become(5);
    });
  },

  findIndex: function(ctor) {
    it('should resolve with -1 if no element satisfies the ' +
      'predicate', function() {
      return ctor.from([2,4,6]).findIndex(isOdd).should.eventually.become(-1);
    });
    it('should resolve with the first index of an element that satisfies ' +
      'the predicate', function() {
        return ctor.from([2,5,6]).findIndex(isOdd).should.eventually.become(1);
    });
  },

  includes: function(ctor) {
    it('should resolve with false if a value is not in the list', function() {
      return ctor.from([2,4,6]).includes(1).should.eventually.become(false);
    });
    it('should resolve with true if a value is in the list', function() {
      return ctor.from([2,4,6]).includes(6).should.eventually.become(true);
    });
    it('should search from a given index', function() {
      return ctor.from([2,4,6]).includes(2, 1).should.eventually.become(false);
    });
    it('should match NaN', function() {
      return ctor.from([1, NaN]).includes(NaN).should.eventually.become(true);
    });
  },

  indexOf: function(ctor) {
    it('should resolve -1 if a value is not in the list', function() {
      return ctor.from([]).indexOf(1).should.eventually.become(-1);
    });
    it('should resolve with the first index of at which a ' +
      'value appears', function() {
      return ctor.from([0,1,5,1]).indexOf(1).should.eventually.become(1);
    });
  },

  join: function(ctor) {
    it('should resolve with a blank string for an empty list', function() {
      return ctor.from([]).join('haha').should.eventually.become('');
    });
    it('should insert a separator between values in a list', function() {
      return ctor.from(['a','b','c']).join('x')
        .should.eventually.become('axbxc');
    });
    it('should default to a comma separator if none is provided', function() {
      return ctor.from(['a','b','c']).join()
        .should.eventually.become('a,b,c');
    });
  },

  lastIndexOf: function(ctor) {
    it('should resolve with -1 if a value is not in the list', function() {
      return ctor.from([]).lastIndexOf(1).should.eventually.become(-1);
    });
    it('should resolve with the last index of at which a ' +
      'value appears', function() {
      return ctor.from([0,1,5,1]).lastIndexOf(1).should.eventually.become(3);
    });
  },

  map: function(ctor) {
    var mapped = ctor.from([1,3,4]).map(isOdd);
    it('should return a new ' + ctor.name, function() {
      return mapped.should.be.an.instanceof(ctor);
    });
    it('should map a function over a list', function() {
      return mapped.value().should.eventually.deep.equal([true, true, false]);
    });
  },

  reduce: function(ctor) {
    it('should resolve with the accumulator for a blank list', function() {
      return ctor.from([]).reduce(add, 4).should.eventually.become(4);
    });
    it('should reduce a list to a single value', function() {
      return ctor.from([1,2,3]).reduce(add, 4).should.eventually.become(10);
    });
    it('should work left to right', function() {
      return ctor.from([1,2,3]).reduce(or, 0).should.eventually.become(1);
    });
  },

  reduceRight: function(ctor) {
    it('should reduce a list to a single value', function() {
      return ctor.from([1,2,3]).reduceRight(add, 4)
        .should.eventually.become(10);
    });
    it('should work right to left', function() {
      return ctor.from([1,2,3]).reduceRight(or, 0).should.eventually.become(3);
    });
  },

  reverse: function(ctor) {
    var reversed = ctor.from([1,2,3]).reverse();
    var desired = [3,2,1];
    it('should return a new ' + ctor.name, function() {
      return reversed.should.be.an.instanceof(ctor);
    });
    it('should have the right length', function() {
      return reversed.should.have.length(3);
    });
    it('should reverse a list', function() {
      return reversed.value().should.eventually.deep.equal(desired);
    });
    it('should have a correct head', function() {
      return testHead(reversed, desired);
    });
    it('should reverse an empty list', function() {
      return ctor.of().reverse().value().should.eventually.deep.equal([]);
    });
    it('should have length zero until the source list has ended', function() {
      var source = new ctor();
      var otherReversed = source.reverse();
      otherReversed.should.have.length(0);
      source.push(1,2,3);
      otherReversed.should.have.length(0);
      source.end();
      return otherReversed.value().should.eventually.deep.equal(desired);
    });
  },

  slice: function(ctor) {
    var list = ctor.from([0,1,2,3,4,5,6,7]);
    it('should return a new ' + ctor.name, function() {
      return list.slice().should.be.an.instanceof(ctor);
    });
    it('should get the values indexed starting at the first argument and ' +
      'ending before the second argument', function() {
        return list.slice(1, 5).value().should.eventually.deep.equal([1,2,3,4]);
    });
    it('should slice until the end of the list when there is ' +
      'no second argument', function() {
        return list.slice(5).value().should.eventually.deep.equal([5,6,7]);
    });
    it('a non-Number second argument should be interpreted as 0', function() {
        return list.slice(0, 'apple').value()
          .should.eventually.deep.equal([]);
    });
    it('should default the first argument to zero', function() {
      return list.slice().value()
        .should.eventually.deep.equal([0,1,2,3,4,5,6,7]);
    });
    it('should slice correctly when the list has not yet ended', function() {
      var list = new ctor();
      setTimeout(list.end, 0);
      list.push(0,1,2,3,4,5,6,7);
      return list.slice(2, 5).value()
        .should.eventually.deep.equal([2,3,4]);
    });
    it('should return an empty list when the end index is less than ' +
      'the start', function() {
        return list.slice(4, 1).value().should.eventually.deep.equal([]);
    });
    it('should correctly slice from negative indexes', function() {
        return list.slice(-4).value()
          .should.eventually.deep.equal([4,5,6,7]);
    });
    it('should correctly slice from negative indexes of a non-' +
      'ended list', function() {
        var list = new ctor();
        setTimeout(list.end, 0);
        list.push(0,1,2,3,4,5,6,7);
        return list.slice(-4, -2).value()
          .should.eventually.deep.equal([4,5]);
    });
    it('should return an empty list when the original list ends later such ' +
      'that the resulting slice has no size', function() {
        var list = new ctor();
        setTimeout(list.end, 0);
        list.push(0,1,2,3,4,5,6,7);
        return list.slice(-3, 2).value()
          .should.eventually.deep.equal([]);
    });
  },

  some: function(ctor) {
    it('should resolve with false when predicates are vacuously ' +
      'false', function() {
      return ctor.from([]).some(isOdd).should.eventually.become(false);
    });
    it('should resolve with true when some predicate is ' +
      'true', function() {
      return ctor.from([2,4,5]).some(isOdd).should.eventually.become(true);
    });
    it('should resolve with false when there is no ' +
      'true predicate', function() {
      return ctor.from([2,4,6]).some(isOdd).should.eventually.become(false);
    });
  },

  sort: function(ctor) {
    var sorted = ctor.from([3,2,1]).sort();
    var desired = [1,2,3];
    it('should return a new ' + ctor.name, function() {
      return sorted.should.be.an.instanceof(ctor);
    });
    it('should have the right length', function() {
      return sorted.should.have.length(3);
    });
    it('should have the right value', function() {
      return sorted.value().should.eventually.deep.equal(desired);
    });
    it('should have length zero until the source list has ended', function() {
      var source = new ctor();
      var otherSorted = source.sort();
      otherSorted.should.have.length(0);
      source.push(3,2,1);
      otherSorted.should.have.length(0);
      source.end();
      return otherSorted.value().should.eventually.deep.equal(desired);
    });
  },

  splice: function(ctor) {
    var spliced = ctor.from([1,2,3,4,5]).splice(2,2,'apple');
    it('should return a new ' + ctor.name, function() {
      return spliced.should.be.an.instanceof(ctor);
    });
    it('should delete and insert as appropriate', function() {
      return spliced.value().should.eventually.deep.equal([1,2,'apple',5]);
    });
    it('should respond back with a list with the same values if there are no' +
      'insertions or deletions', function() {
        return ctor.of(1,2,3).splice(2,0).value()
          .should.eventually.deep.equal([1,2,3]);
    });
    it('should not delete all remaining elements if no second argument ' +
      'is given', function() {
        return ctor.from([1,2,3,4]).splice(2).value()
          .should.eventually.deep.equal([1,2]);
    });
    it('should splice a list that has not yet ended', function() {
      var list = new ctor();
      list.push(1,2,3,4,5);
      setTimeout(list.end, 0);
      return list.splice(2,2,'apple').value()
        .should.eventually.deep.equal([1,2,'apple',5]);
    });
    it('should properly insert values when no elements are deleted',
      function() {
      return ctor.from([1,2,3,4]).splice(2,0,'apple').value()
        .should.eventually.deep.equal([1,2,'apple',3,4]);
    });
    it('should return a list with the same elements if no arguments are given',
      function() {
        return ctor.from([1,2,3]).splice().value()
          .should.eventually.deep.equal([1,2,3]);
    });
    it('should interpret a non-Number first argument as zero', function() {
      return ctor.from([1,2,3,4]).splice(null, 2).value()
        .should.eventually.deep.equal([3, 4]);
    });
    it('should splice properly when the first argument is negative',
      function() {
        var list = new ctor();
        list.push(1,2,3,4,5);
        setTimeout(list.end, 0);
        return list.splice(-3,2,'apple').value()
          .should.eventually.deep.equal([1,2,'apple',5]);
    });
    it('should splice a list properly when the first argument is greater that' +
      'the length of the list', function() {
        return ctor.of(1,2,3,4,5).splice(8, 1, 'apple').value()
          .should.eventually.deep.equal([1,2,3,4,5,'apple']);
    });
    it('should delete no elements when the second argument is negative',
      function() {
        return ctor.of(1,2,3).splice(0,-1,'apple').value()
          .should.eventually.deep.equal(['apple',1,2,3]);
    });
    it('should correctly splice from zero', function() {
      return ctor.of(1,2,3).splice(0,0,'apple').value()
        .should.eventually.deep.equal(['apple',1,2,3]);
    });
  }

};

// Tests the assertions for a given LaterList constructor
function testLaterList(ctor) {
  Object.keys(assertions).forEach(function(toDescribe) {
    describe(toDescribe, function() {
      return assertions[toDescribe](ctor);
    });
  });
}

describe('LaterList', function() {
  laterListCtors.forEach(function(ctor) {
    describe(ctor.name, function() {
      return testLaterList(ctor);
    });
  });
});
