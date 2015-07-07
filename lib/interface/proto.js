/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var Node = require('./Node'),
  u = require('../utils'),
  h = require('./handlers'),
  lProto = require('../Listener').prototype,
  slice = Array.prototype.slice,
  LaterList = require('./index');

/** @lends {LaterList.prototype}  */
var proto = {
  /**
   * Returns a new list comprised of the list on which it is called joined with
   * the list-like(s) and/or value(s) provided as arguments.
   * @param  {...Object.<{forEach: function}>} lists list-likes to concatenate
   *                                                 to this list.
   * @return {LaterList} A list whose nodes have the concatenated values of the
   *                     supplied arguments.
   */
  concat: function(/* lists */) {
    var lists = slice.call(arguments, 0);
    lists.unshift(this);
    return this.constructor.from(lists).link(function(list) {
      if (list && typeof list.forEach === 'function')
        return list.forEach(u.pushOne, this);
      this.push(list);
    });
  },

  /**
   * Tests whether all nodes in the list pass the test implemented by the
   * provided function.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the predicate.
   * @lends  {LaterList.prototype}
   * @return {Promise<Boolean>} true if the predicate is true for all nodes in
   *                            the list, false otherwise.
   */
  every: function(predicate, thisArg) {
    return this.consume(h.fork(predicate.bind(thisArg), function() {
      this.exit(false);
    }, true), true);
  },

  /**
   * Creates a new LaterList with all nodes that pass the test implemented by
   * the provided function.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the predicate.
   * @lends  {LaterList.prototype}
   * @return {LaterList} A list with the filtered values of the original list.
   */
  filter: function(predicate, thisArg) {
    return this.link(h.fork(predicate.bind(thisArg), lProto.push));
  },

  /**
   * Returns a value in the list, if a node in the list satisfies the provided
   * testing function. Otherwise undefined is returned.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the predicate.
   * @lends  {LaterList.prototype}
   * @return {Promise<*>} The value of the first node to satisfy the predicate.
   */
  find: function(predicate, thisArg) {
    return this.consume(h.fork(predicate.bind(thisArg), lProto.exit));
  },

  /**
   * Returns an index in the list, if a node in the list satisfies the provided
   * testing function. Otherwise -1 is returned.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the predicate.
   * @lends  {LaterList.prototype}
   * @return {Promise<Number>} The first index of a node satisfying the
   *                           predicate.
   */
  findIndex: function(predicate, thisArg) {
    return h.locIndex.call(this, predicate.bind(thisArg), lProto.exit);
  },

  /**
   * Executes a provided function once per node.
   * @param  {function(*,Number)} lambda Function to execute for each element
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the lambda.
   * @lends  {LaterList.prototype}
   * @return {Promise<undefined>} Resolves when processing has ended.
   */
  forEach: function(lambda, thisArg) {
    return this.consume(lambda.bind(thisArg));
  },

  /**
   * Determines whether a list includes a certain element, returning true or
   * false as appropriate.
   * @param  {*} toMatch         A value to match.
   * @param  {?Number} fromIndex Optional. The position in this list at which to
   *                             begin searching for searchElement; defaults to
   *                             0.
   * @lends  {LaterList.prototype}
   * @return {Promise<Boolean>} Whether the value appears in the list.
   */
  includes: function(toMatch /* fromIndex */) {
    var fromIndex = parseInt(arguments[1], 10) || 0;
    return this.some(function(value, index) {
      return index >= fromIndex && (toMatch === value ||
        (toMatch !== toMatch && value !== value));
    });
  },

  /**
   * Returns the first index at which a given value can be found in the list, or
   * -1 if it is not present.
   * @param  {*} toMatch A value to match.
   * @lends {LaterList.prototype}
   * @return {Promise<Number>} The first index of a node with the supplied value.
   */
  indexOf: function(toMatch) {
    return h.matchIndex.call(this, toMatch, lProto.exit);
  },

  /**
   * Joins all values of a list into a string.
   * @param  {?String} separator Specifies a string to separate each value of
   *                             the list.
   * @lends  {LaterList.prototype}
   * @return {Promise<String>}
   */
  join: function(separator) {
    if (typeof separator === 'undefined')
      separator = ',';
    return this.reduce(function(accumulator, value, index) {
      return accumulator + (index ? separator : '') + value;
    }, '');
  },

  /**
   * Returns the last index at which a given value can be found in the list, or
   * -1 if it is not present.
   * @param  {*} toMatch A value to match.
   * @lends  {LaterList.prototype}
   * @return {Promise<Number>} The last index of a node with the supplied value.
   */
  lastIndexOf: function(toMatch) {
    return h.matchIndex.call(this, toMatch, lProto.set);
  },

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
  map: function(lambda, thisArg) {
    return this.link(function(value, index) {
      return this.push(lambda.call(thisArg, value, index));
    });
  },

  /**
   * Applies a function against an accumulator and each node of the list (from
   * left-to-right) has to reduce it to a single value.
   * @param  {function(*,Number)} lambda Function to execute for each element
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the lambda.
   * @lends  {LaterList.prototype}
   * @return {Promise<*>} The reduced value.
   */
  reduce: function(lambda, accumulator) {
    return this.consume(function(value, index) {
      this.set(Promise.resolve(this.value).then(function(accumulator) {
        return lambda(accumulator, value, index);
      }));
    }, accumulator);
  },

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
  reduceRight: function(lambda, accumulator) {
    return this.reverse().reduce(lambda, accumulator);
  },

  /**
   * Returns a reversed list. The first list node becomes the last and the last
   * becomes the first. Note that while this operation maintains a copy of each
   * node and can only complete when the list has ended. As this is
   * computationally expensive, finding other approaches is recommended.
   * @lends  {LaterList.prototype}
   * @return {LaterList} A new list with the values of this list reversed.
   */
  reverse: function() {
    var reversedList = new this.constructor();
    this.consume(function(value) {
      // The value of the listener is a reference to the reversed list's head.
      var headRef = this.value,
        node = new Node(value);
      // The new node points to the previous head.
      node.next = headRef.next;
      // The new node is now the head.
      headRef.next = node;
    }, new Node()).then(function(node) {
      // Initially, node is the reference to the head.
      // Iterate over the next nodes.
      while (node = node.next) // jshint ignore:line
        // Pushing each value onto the reversedList.
        reversedList.push(node.value);
      // Finally end the reversed list.
      reversedList.end();
    }, reversedList.end);
    // Return the reversed list.
    return reversedList;
  },

  /**
   * Returns a shallow copy of a portion of a list into a new list.
   * @param  {?Number} begin An index to begin at.
   * @param  {?Number} end   An index to end at.
   * @lends  {LaterList.prototype}
   * @return {LaterList} A list with the sliced portion of this list.
   */
  slice: function(begin, end) {
    // Start at zero if begin is not a natural number.
    var start = +begin || 0,
      // Slice indefinitely if no end is provided, or to zero if end can't be
      // parsed as an integer.
      upTo = (typeof end === 'undefined') ? Infinity : +end || 0,
      naturalStart = start >= 0,
      naturalEnd = upTo >= 0;

    // If upTo is less than or equal to start and they share a sign, then return
    // an empty list.
    if (upTo <= start && (naturalStart === naturalEnd))
      return this.constructor.from([]);

    // If start and upTo are both at least zero, slicing can start immediately
    // as it does not depend upon the final length of the list.
    if (this._state.ended || (naturalStart && naturalEnd))
      return h.slice.call(this, start, upTo);

    // If at least one index provided is negative, slicing begins when this list
    // has ended, after which we know the length.
    var thisList = this;
    // Create a sliced list to return now.
    var slicedList = new this.constructor();
    this.when().then(function() {
      // Calculate the indexes using the final length of this list.
      // Slice this list, pushing each result onto the sliced list.
      return h.slice.call(thisList, start, upTo)
        .forEach(u.pushOne, slicedList);
    }).then(slicedList.end, slicedList.end);
    // Return the sliced list.
    return slicedList;
  },

  /**
   * Tests whether some element in the list passes the test implemented by the
   * provided function.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object} thisArg Optional. Value to use as this when executing
   *                           predicate.
   * @lends {LaterList.prototype}
   * @return {Promise<Boolean>} true if the predicate is true for some node in
   *                            the list, false otherwise.
   */
  some: function(predicate, thisArg) {
    return this.consume(h.fork(predicate.bind(thisArg), function() {
      this.exit(true);
    }), false);
  },

  /**
   * Returns a LaterList with the sorted nodes of this list. Note that this
   * operation can only commence when the list has ended and requires all the
   * values of the list collected in an array before they are sorted and copied
   * to the resulting list. As this is computationally expensive, finding other
   * approaches is recommended.
   * @param  {?Function} compare Optional. A function on which to sort.
   * @lends {LaterList.prototype}
   * @return {LaterList} A new list with sorted values from this list.
   */
  sort: function(compare) {
    var sortedList = new this.constructor();
    this.value().then(function(arr) {
      arr.sort(compare);
      arr.forEach(u.pushOne, sortedList);
      sortedList.end();
    }, sortedList.end);
    return sortedList;
  },

  /**
   * Returns a new list with some nodes in this list removed and/or some nodes
   * added.
   * @param  {?Number} begin       An index to begin at.
   * @param  {?Number} deleteCount The number of elements to remove.
   * @param  {...*}    additions   Values to add to the list.
   * @lends {LaterList.prototype}
   * @return {LaterList} A new list with the modified values from this list.
   */
  splice: function(begin, deleteCount /* additions */) {
    var len = arguments.length;
    if (!len)
      return this.constructor.from(this);
    var delEnd, size, additions = slice.call(arguments, 2),
      start = parseInt(begin, 10) || 0;
    if (len === 1) {
      delEnd = Infinity;
      size = start;
    } else {
      delEnd = start + (parseInt(deleteCount, 10) || 0);
      size = Infinity;
    }
    return this.link(function(value, index) {
      if (index === start)
        additions.forEach(this.push, this);
      if (index < start || index >= delEnd) {
        this.push(value);
        if (!(--size))
          this.end();
      }
    });
  }
};

module.exports = proto;
