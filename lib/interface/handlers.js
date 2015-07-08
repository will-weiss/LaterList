/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

/**
 * Wraps a predicate and a lambda function, returning a function to be executed
 * by a Listener which will execute the lambda when the predicate returns true.
 * An optional negate argument may be supplied to negate the result of the
 * predicate.
 * @param  {function(*,Number)} predicate A function testing nodes.
 * @param  {function(*,Number)} lambda A function to execute in the context of
 *                                     the listener when the test passes.
 * @param  {?Boolean} negate    If true, negate the result of the predicate.
 * @return {function(*,Number)} A function to be executed by a Listener.
 * @private
 */
exports.fork = function(predicate, lambda, negate) {
  var assert = !negate;
  return function(value, index) {
    var listenerContext = this;
    return Promise.resolve(predicate(value, index))
      .then((function(res) {
        if (Boolean(res) === assert)
          lambda.call(listenerContext, value, index);
      }));
  };
};

/**
 * Locates an index in a list which passes a predicate function, resolving with
 * an index.
 * @param  {function(*,Number)} predicate A function testing nodes.
 * @param  {function(Number)}   onLocate  A function run on a matching index.
 * @return {Promise<Number>} The located index.
 * @private
 */
exports.locIndex = function(predicate, onLocate) {
  var onData = exports.fork(predicate, function(value, index) {
    onLocate.call(this, index);
  });
  return this.consume(onData, -1);
};

/**
 * Matches values in a list, resolving with an index.
 * @param  {*}                toMatch A value to match.
 * @param  {function(Number)} onMatch A function run when a match is found.
 * @return {Promise<Number>} The matching index.
 * @private
 */
exports.matchIndex = function(toMatch, onMatch) {
  return exports.locIndex.call(this, function(test) {
    return toMatch === test;
  }, onMatch);
};

/**
   * Returns a shallow copy of a portion of a list into a new list.
   * @param  {Number} start An index to begin at.
   * @param  {Number} upTo  An index to end at.
   * @return {LaterList} A list with the sliced portion of this list.
 */
exports.slice = function(start, upTo) {
  // If start or upTo are negative, add the length of this list to determine the
  // proper index.
  start += (start < 0) * this.length,
  upTo += (upTo < 0) * this.length;
  var size = upTo - start;
  // Immediately return an empty list if the slice does not have positive
  // nonzero size.
  if (size <= 0)
    return this.constructor.of();
  // Otherwise, link this list to a new list
  return this.link(function(value, index) {
    // Skip values outside the range of the slice.
    if (index < start || index >= upTo)
      return;
    // Push values in the range of the slice.
    this.push(value);
    // If there are no more elements in the slice, end.
    if (!(--size))
      this.end();
  });
};

exports.splice = function(start, toDel, additions) {
  // If the index to start splicing at is at least the length of this list,
  // return a list constructed from this list.
  start += (start < 0) * this.length;
  var insertBefore = Math.min(start, this.length);
  var upTo = start + (toDel >= 0 ? toDel : 0);
  return this.link(function(value, index) {
    // Immediately insert additions if the current index and the index to insert
    // before are both zero.
    if (!index && !insertBefore)
      additions.forEach(this.push, this);
    // Push values out of the range of deletions.
    if (index < start || index >= upTo)
      this.push(value);
    // If the index is the index to insert before, insert additions.
    if (index + 1 === insertBefore)
      additions.forEach(this.push, this);
  });
};
