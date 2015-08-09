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

var proto = {
  /**
   * Returns a new list comprised of the list on which it is called joined with
   * the list-like(s) and/or value(s) provided as arguments.
   * @param  {...Object.<{forEach: function}>} lists list-likes to concatenate
   *                                                 to this list.

   * @memberof LaterList.prototype
   * @return {LaterList} A list whose nodes have the concatenated values of the
   *                     supplied arguments.
   */
  concat: function(/* lists */) {
    var lists = slice.call(arguments, 0);
    lists.unshift(this);
    return this.constructor.from(lists).link(function(value) {
      // Values that are list-like have their values pushed.
      if (value && typeof value.forEach === 'function')
        return value.forEach(u.pushOne, this);
      // Other values are themselves pushed.
      this.push(value);
    });
  },

  /**
   * Tests whether all nodes in the list pass the test implemented by the
   * provided function.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object}            thisArg Optional. Value to use as this when
   *                                      executing the predicate.
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
   * @return {Promise<Boolean>} Whether the value appears in the list.
   */
  includes: function(toMatch /* fromIndex */) {
    var fromIndex = parseInt(arguments[1], 10) || 0;
    return this.some(function(value, index) {
      return index >= fromIndex && (toMatch === value ||
        // Matches NaN which is unique in that NaN !== NaN.
        (toMatch !== toMatch && value !== value));
    });
  },

  /**
   * Returns the first index at which a given value can be found in the list, or
   * -1 if it is not present.
   * @param  {*} toMatch A value to match.
   * @memberof LaterList.prototype
   * @return {Promise<Number>} The first index of a node with the supplied value.
   */
  indexOf: function(toMatch) {
    return h.matchIndex.call(this, toMatch, lProto.exit);
  },

  /**
   * Joins all values of a list into a string.
   * @param  {?String} separator Specifies a string to separate each value of
   *                             the list.
   * @memberof LaterList.prototype
   * @return {Promise<String>}
   */
  join: function(separator) {
    if (typeof separator === 'undefined')
      separator = ',';
    return this.reduce(function(accumulator, value, index) {
      // Separators are inserted after the first index.
      return accumulator + (index ? separator : '') + value;
    }, '');
  },

  /**
   * Returns the last index at which a given value can be found in the list, or
   * -1 if it is not present.
   * @param  {*} toMatch A value to match.
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
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
   * @param  {*}                  initialValue Optional. Object to use as the
   *                                           first argument to the first call
   *                                           of the lambda.
   * @memberof LaterList.prototype
   * @return {Promise<*>} The reduced value.
   */
  reduce: function(lambda, initialValue) {
    return this.consume(function(value, index) {
      // Set the value of the listener to be the result of the lambda function
      // called with the prior accumulator and this node.
      this.set(Promise.resolve(this.value).then(function(accumulator) {
        return lambda(accumulator, value, index);
      }));
    }, initialValue);
  },

  /**
   * Applies a function against an accumulator and each node of the list (from
   * right-to-left) has to reduce it to a single value. Note that this operation
   * can only commence when the list has ended and been reversed. As this is
   * computationally expensive, finding other approaches is recommended.
   * @param  {function(*,Number)} lambda Function to execute for each element
   * @param  {*}                  initialValue Optional. Object to use as the
   *                                           first argument to the first call
   *                                           of the lambda.
   * @memberof LaterList.prototype
   * @return {Promise<*>} The reduced value.
   */
  reduceRight: function(lambda, initialValue) {
    return this.reverse().reduce(lambda, initialValue);
  },

  /**
   * Returns a reversed list. The first list node becomes the last and the last
   * becomes the first. Note that while this operation maintains a copy of each
   * node and can only complete when the list has ended. As this is
   * computationally expensive, finding other approaches is recommended.
   * @memberof LaterList.prototype
   * @return {LaterList} A new list with the values of this list reversed.
   */
  reverse: function() {
    // Create a list whose nodes will be added when this list ends. Nodes cannot
    // be pushed onto the reversed list when the arrive as they are to be
    // reversed. Instead, a listener maintains the eventual head of the reversed
    // list and new nodes become the new eventual head which point to the
    // previous head.
    var thisList = this,
      reversed = new this.constructor();
    this.consume(function(value) {
      // The latest value becomes the new head.
      var head = new Node(value);
      // The next node is the previous head.
      head.next = this.value;
      // Set the value of the listener to be the head.
      this.value = head;
    }).then(function(head) {
      // If there is a head of the list:
      if (head) {
        // Set the head of the reversed list.
        reversed._headRef.next = head;
        // The length of the reversed list is the length of this list.
        reversed.length = thisList.length;
        // Revive the listeners of the list such that they shift.
        reversed.revive(lProto.shift);
      }
      // Indicate that the reversed list has ended.
      reversed.end();
    }, reversed.end);
    // Return the reversed list. Its values will be pushed when this list ends.
    return reversed;
  },

  /**
   * Returns a shallow copy of a portion of a list into a new list.
   * @param  {?Number} begin An index to begin at.
   * @param  {?Number} end   An index to end at.
   * @memberof LaterList.prototype
   * @return {LaterList} A list with the sliced portion of this list.
   */
  slice: function(begin, end) {
    // Coerce the starting index to a number, defaulting to zero.
    var start = +begin || 0,
      // Slice indefinitely if no end is provided, otherwise coerce the ending
      // index to a number, defaulting to zero.
      upTo = (typeof end === 'undefined') ? Infinity : +end || 0,
      // Store whether the starting and ending indexes are natural numbers.
      naturalStart = start >= 0,
      naturalEnd = upTo >= 0;

    // If upTo is less than or equal to start and they share a sign, then return
    // an empty list.
    if (upTo <= start && (naturalStart === naturalEnd))
      return this.constructor.of();

    // Slicing can start immediately if the list has ended or if start and upTo
    // are both at least zero as in this case the indexes to slice at do not
    // depend on the final length of the list.
    if (this._state.ended || (naturalStart && naturalEnd))
      return h.slice.call(this, start, upTo);

    // If at least one index provided is negative and this list has not ended,
    // slicing begins when this list has ended after which we know the length.
    var thisList = this;
    // Create a sliced list to return.
    var sliced = new this.constructor();
    this.when().then(function() {
      // Slice this list, pushing each result onto the sliced list already
      // returned.
      return h.slice.call(thisList, start, upTo).forEach(u.pushOne, sliced);
    }).then(sliced.end, sliced.end);
    // Return the sliced list immediately. Values will be pushed when this list
    // ends.
    return sliced;
  },

  /**
   * Tests whether some element in the list passes the test implemented by the
   * provided function.
   * @param  {function(*,Number)} predicate Function to test for each element.
   * @param  {?Object} thisArg Optional. Value to use as this when executing
   *                           predicate.
   * @memberof LaterList.prototype
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
   * @memberof LaterList.prototype
   * @return {LaterList} A new list with sorted values from this list.
   */
  sort: function(compare) {
    var sorted = new this.constructor();
    this.value().then(function(arr) {
      arr.sort(compare);
      arr.forEach(u.pushOne, sorted);
      sorted.end();
    }, sorted.end);
    return sorted;
  },

  /**
   * Returns a new list with some nodes in this list removed and/or some nodes
   * added.
   * @param  {?Number} begin       An index to begin at.
   * @param  {?Number} deleteCount The number of elements to remove.
   * @param  {...*}    additions   Values to add to the list.
   * @memberof LaterList.prototype
   * @return {LaterList} A new list with the modified values from this list.
   */
  splice: function(begin, deleteCount /* additions */) {
    var len = arguments.length;
    if (!len)
      return this.constructor.from(this);
    // Coerce the starting index to a number, defaulting to zero.
    var start = +begin || 0,
      // If no second argument was supplied, delete indefinitely, otherwise
      // coerce the delete count to a number, defaulting to zero.
      toDel = len === 1 ? Infinity : +deleteCount || 0,
      // Collect subsequent arguments as values to add to the list.
      additions = slice.call(arguments, 2);

    // If there are neither deletions nor additions to make, return a list
    // constructed from this list.
    if (toDel <= 0 && !additions.length)
      return this.constructor.from(this);

    // Splicing can start immediately if this list has ended, or if the starting
    // index is at least zero as in this case the index to splice at does not
    // depend on the final length of the list.
    if (this._state.ended || start >= 0)
      return h.splice.call(this, start, toDel, additions);

    // If at least one index provided is negative and this list has not ended,
    // splicing begins when this list has ended after which we know the length.
    var thisList = this;
    // Create a sliced list to return.
    var spliced = new this.constructor();
    this.when().then(function() {
      // Slice this list, pushing each result onto the spliced list already
      // returned.
      return h.splice.call(thisList, start, toDel, additions)
        .forEach(u.pushOne, spliced);
    }).then(spliced.end, spliced.end);
    // Return the spliced list immediately. Values will be pushed when this list
    // ends.
    return spliced;
  }
};

module.exports = proto;
