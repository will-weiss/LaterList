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
 * @param  {...Object.<{forEach: function}>} lists list-likes to concatenate to
 *                                                 this list.
 * @lends  {LaterList.prototype}
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
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the predicate.
 * @lends  {LaterList.prototype}
 * @return {Promise<Boolean>} true if the predicate is true for all nodes in the
 *                            list, false otherwise.
 */
exports.every = function(predicate, thisArg) {
  return this.consume(u.fork(predicate.bind(thisArg), function() {
    this.exit(false);
  }, true), true);
};

/**
 * Creates a new LaterList with all nodes that pass the test implemented by
 * the provided function.
 * @param  {function(*,Number)} predicate Function to test for each element.
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the predicate.
 * @lends  {LaterList.prototype}
 * @return {LaterList} A list with the filtered values of the original list.
 */
exports.filter = function(predicate, thisArg) {
  return this.link(u.fork(predicate.bind(thisArg), lProto.push));
};

/**
 * Returns a value in the list, if a node in the list satisfies the provided
 * testing function. Otherwise undefined is returned.
 * @param  {function(*,Number)} predicate Function to test for each element.
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the predicate.
 * @lends  {LaterList.prototype}
 * @return {Promise<*>} The value of the first node to satisfy the predicate.
 */
exports.find = function(predicate, thisArg) {
  return this.consume(u.fork(predicate.bind(thisArg), lProto.exit));
};

/**
 * Returns an index in the list, if a node in the list satisfies the provided
 * testing function. Otherwise -1 is returned.
 * @param  {function(*,Number)} predicate Function to test for each element.
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the predicate.
 * @lends  {LaterList.prototype}
 * @return {Promise<Number>} The first index of a node satisfying the predicate.
 */
exports.findIndex = function(predicate, thisArg) {
  return u.locIndex.call(this, predicate.bind(thisArg), lProto.exit);
};

/**
 * Executes a provided function once per node.
 * @param  {function(*,Number)} lambda Function to execute for each element
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the lambda.
 * @lends  {LaterList.prototype}
 * @return {Promise<undefined>} Resolves when processing has ended.
 */
exports.forEach = function(lambda, thisArg) {
  return this.consume(lambda.bind(thisArg));
};

/**
 * Determines whether a list includes a certain element, returning true or false
 * as appropriate.
 * @param  {*} toMatch A value to match.
 * @lends  {LaterList.prototype}
 * @return {Promise<Boolean>} Whether the value appears in the list.
 */
exports.includes = function(toMatch) {
  var fromIndex = parseInt(arguments[1], 10) || 0;
  return this.some(function(value, index) {
    return index >= fromIndex && (toMatch === value ||
      (toMatch !== toMatch && value !== value));
  });
};

/**
 * Returns the first index at which a given value can be found in the list, or
 * -1 if it is not present.
 * @param  {*} toMatch A value to match.
 * @lends {LaterList.prototype}
 * @return {Promise<Number>} The first index of a node with the supplied value.
 */
exports.indexOf = function(toMatch) {
  return u.matchIndex.call(this, toMatch, lProto.exit);
};

/**
 * Joins all values of a list into a string.
 * @param  {?String} separator Specifies a string to separate each value of
 *                             the list.
 * @lends  {LaterList.prototype}
 * @return {Promise<String>}
 */
exports.join = function(separator) {
  if (typeof separator === 'undefined')
    separator = ',';
  return this.reduce(function(accumulator, value, index) {
    return accumulator + (index ? separator : '') + value;
  }, '');
};

/**
 * Returns the last index at which a given value can be found in the list, or
 * -1 if it is not present.
 * @param  {*} toMatch A value to match.
 * @lends  {LaterList.prototype}
 * @return {Promise<Number>} The last index of a node with the supplied value.
 */
exports.lastIndexOf = function(toMatch) {
  return u.matchIndex.call(this, toMatch, lProto.set);
};

/**
 * Creates a new list with the results of calling a provided function on every
 * node in this list.
 * @param  {function(*,Number)} lambda Function to execute for each element
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the lambda.
 * @lends  {LaterList.prototype}
 * @return {LaterList} A new list with the results of mapping the lambda over
 *                     this list.
 */
exports.map = function(lambda, thisArg) {
  return this.link(function(value, index) {
    return this.push(lambda.call(thisArg, value, index));
  });
};

/**
 * Applies a function against an accumulator and each node of the list (from
 * left-to-right) has to reduce it to a single value.
 * @param  {function(*,Number)} lambda Function to execute for each element
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the lambda.
 * @lends  {LaterList.prototype}
 * @return {Promise<*>} The reduced value.
 */
exports.reduce = function(lambda, accumulator) {
  return this.consume(function(value, index) {
    this.set(Promise.resolve(this.value).then(function(accumulator) {
      return lambda(accumulator, value, index);
    }));
  }, accumulator);
};

/**
 * Applies a function against an accumulator and each node of the list (from
 * right-to-left) has to reduce it to a single value. Note that this operation
 * can only commence when the list has ended and been reversed. As this is
 * computationally expensive, finding other approaches is recommended.
 * @param  {function(*,Number)} lambda Function to execute for each element
 * @param  {?Object}            thisArg Optional. Value to use as this when
 *                                      executing the lambda.
 * @lends  {LaterList.prototype}
 * @return {Promise<*>} The reduced value.
 */
exports.reduceRight = function(lambda, accumulator) {
  return this.reverse().reduce(lambda, accumulator);
};

/**
 * Returns a reversed list. The first list node becomes the last and the last
 * becomes the first. Note that while this operation maintains a copy of each
 * node and can only complete when the list has ended. As this is
 * computationally expensive, finding other approaches is recommended.
 * @lends  {LaterList.prototype}
 * @return {LaterList} A new list with the values of this list reversed.
 */
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
  return reversedList;
};

/**
 * Returns a shallow copy of a portion of a list into a new list.
 * @param  {?Number} begin An index to begin at.
 * @param  {?Number} end   An index to end at.
 * @lends  {LaterList.prototype}
 * @return {LaterList} A list with the sliced portion of this list.
 */
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
  return this.consume(u.fork(predicate.bind(thisArg), function() {
    this.exit(true);
  }), false);
};

/**
 * Returns a LaterList with the sorted nodes of this list. Note that this
 * operation can only commence when the list has ended and requires all the
 * values of the list collected in an array before they are sorted and copied
 * to the resulting list. As this is computationally expensive, finding other
 * approaches is recommended.
 * @param  {Function} compare A function on which to sort.
 * @lends {LaterList.prototype}
 * @return {LaterList} A new list with sorted values from this list.
 */
exports.sort = function(compare) {
  var sortedList = new this.constructor();
  this.value().then(function(arr) {
    arr.sort(compare);
    arr.forEach(sortedList.push, sortedList);
    sortedList.end();
  }, sortedList.end);
  return sortedList;
};

/**
 * Returns a new list with some nodes in this list removed and/or some nodes
 * added.
 * @param  {?Number} begin       An index to begin at.
 * @param  {?Number} deleteCount The number of elements to remove.
 * @param  {...*}    additions   Values to add to the list.
 * @lends {LaterList.prototype}
 * @return {LaterList} A new list with the modified values from this list.
 */
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
