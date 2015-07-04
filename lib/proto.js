/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var Node = require('./Node'),
  u = require('./utils'),
  lProto = require('./Listener').prototype;

/**
 * Returns a new list comprised of the list on which it is called joined with
 * the list-like(s) and/or value(s) provided as arguments.
 * @param {...Object.<{forEach: function}>} lists list-likes to concatenate to
 *                                                this list.
 * @lends {LaterList.prototype}
 * @return {LaterList} A list whose nodes have the concatenated values of the
 *                     supplied arguments.
 */
exports.concat = function() {
  var lists = Array.prototype.slice.call(arguments);
  lists.unshift(this);
  return this.constructor.from(lists).link(function(list) {
    if (list && typeof list.forEach === 'function')
      return list.forEach(this.push, this);
    this.push(list);
  });
};

/**
 * Tests whether all nodes in the list pass the test implemented by the
 * provided function.
 * @param  {function(*,Number)} predicate Function to test for each element.
 * @param  {?Object} thisArg Optional. Value to use as this when executing
 *                           predicate.
 * @lends {LaterList.prototype}
 * @return {Promise<Boolean>} true if the predicate is true for all nodes in the
 *                            list, false otherwise.
 */
exports.every = function(predicate, thisArg) {
  return this.consume(u.ternary(predicate.bind(thisArg), u.noop, function() {
    this.exit(false);
  }), true);
};

/**
 * Creates a new LaterList with all nodes that pass the test implemented by
 * the provided function.
 * @param  {[type]} predicate Function to test for each element.
 * @param  {[type]} thisArg Optional. Value to use as this when executing
 *                          predicate.
 * @lends {LaterList.prototype}
 * @return {LaterList}
 */
exports.filter = function(predicate, thisArg) {
  return this.link(u.ternary(predicate.bind(thisArg), lProto.push, u.noop));
};

exports.find = function(predicate, thisArg) {
  return this.consume(u.ternary(predicate.bind(thisArg), lProto.exit, u.noop));
};

exports.findIndex = function(predicate, thisArg) {
  return u.locIndex.call(this, predicate.bind(thisArg), lProto.exit);
};

exports.forEach = function(lambda, thisArg) {
  return this.consume(lambda.bind(thisArg));
};

exports.includes = function(toMatch) {
  var fromIndex = parseInt(arguments[1], 10) || 0;
  return this.some(function(value, index) {
    return index >= fromIndex && (toMatch === value ||
      (toMatch !== toMatch && value !== value));
  });
};

exports.indexOf = function(toMatch) {
  return u.matchIndex.call(this, toMatch, lProto.exit);
};

exports.join = function(separator) {
  if (typeof separator === 'undefined')
    separator = ',';
  return this.reduce(function(accumulator, value, index) {
    return accumulator + (index ? separator : '') + value;
  }, '');
};

exports.lastIndexOf = function(toMatch) {
  return u.matchIndex.call(this, toMatch, lProto.set);
};

exports.map = function(lambda, thisArg) {
  return this.link(function(value, index) {
    return this.push(lambda.call(thisArg, value, index));
  });
};

exports.reduce = function(lambda, accumulator) {
  return this.consume(function(value, index) {
    this.set(Promise.resolve(this.value).then(function(accumulator) {
      return lambda(accumulator, value, index);
    }));
  }, accumulator);
};

exports.reduceRight = function(lambda, accumulator) {
  return this.reverse().then(function(reversedList) {
    var len = reversedList.length;
    return reversedList.reduce(function(accumulator, value, index) {
      return lambda(accumulator, value, len - index);
    }, accumulator);
  });
};

exports.reverse = function() {
  var reversedList = new this.constructor();
  this.consume(function(value, index) {
    var headRef = this.value,
      node = new Node(value);
    node.next = headRef.next;
    headRef.next = node;
  }, new Node()).then(function(headRef) {
    node = headRef.next;
    while (node) {
      reversedList.push(node.value);
      node = node.next;
    }
    reversedList.end();
  }, reversedList.end);
  this.reverse = u.constant(reversedList);
  return reversedList;
};

exports.slice = function(begin, end) {
  var start = (begin >= 0) ? parseInt(begin, 10) : 0,
    upTo = (end <= start) ? 0 : (parseInt(end, 10) || Infinity),
    size = upTo - start;
  if (size <= 0)
    return this.constructor.from([]);
  return this.filter(function(value, index) {
    if (index < start || index >= upTo)
      return false;
    if (--size)
      return true;
    this.push(value);
    this.end();
  });
};

/**
 * Tests whether some element in the list passes the test implemented by the
 * provided function.
 * @param  {function(*,Number)} predicate Function to test for each element.
 * @param  {?Object} thisArg Optional. Value to use as this when executing
 *                           predicate.
 * @lends {LaterList.prototype}
 * @return {Promise<Boolean>} true if the predicate is true for some node in the
 *                            list, false otherwise.
 */
exports.some = function(predicate, thisArg) {
  return this.consume(u.ternary(predicate.bind(thisArg), function() {
    this.exit(true);
  }, u.noop), false);
};

exports.sort = function(compare) {
  var sortedList = new this.constructor();
  this.value().then(function(arr) {
    var clone = arr.slice(0);
    clone.sort(compare);
    clone.forEach(sortedList.push, sortedList);
    sortedList.end();
  }, sortedList.end);
  this.sort = u.constant(sortedList);
  return sortedList;
};

exports.splice = function(begin, deleteCount) {
  var additions = Array.prototype.slice.call(arguments, 2),
    start = (begin >= 0) ? parseInt(begin, 10) : 0,
    upTo = start + (parseInt(deleteCount, 10) || 0);
  return this.filter(function(value, index) {
    if (index === upTo)
      additions.forEach(this.push, this);
    return index < start || index >= upTo;
  });
};
