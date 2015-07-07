/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var u = require('../utils');

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
  var test = !negate;
  return function(value, index) {
    var listenerContext = this;
    return Promise.resolve(predicate(value, index))
      .then((function(res) {
        if (!!res === test)
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
  start += start >= 0 ? 0 : this.length;
  upTo += upTo >= 0 ? 0 : this.length;
  var size = upTo - start;
  return this.link(function(value, index) {
    if (index < start || index >= upTo)
      return;
    this.push(value)
    if (!(--size))
      this.end();
  });
};