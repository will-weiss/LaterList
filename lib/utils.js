/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

/**
 * Returns a function that returns a constant value.
 * @param  {*} value A value.
 * @return {Function} A nullary function that returns a contant value.
 */
exports.constant = function(value) {
  return function() { return value; };
};

/**
 * Copies keys from a source object to a destination object.
 * @param  {Object} destination An object.
 * @param  {Object} source      An object.
 */
exports.extend = function(destination, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key))
      destination[key] = source[key];
  }
};

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
 */
exports.matchIndex = function(toMatch, onMatch) {
  return exports.locIndex.call(this, function(test) {
    return toMatch === test;
  }, onMatch);
};

/**
 * Dummy function to stand in for other functions. Performs no operation.
 */
exports.noop = function() {};

/**
 * Adds methods from a constructor and its prototype to a subclass. Properties
 * of an optional third argument are added to the subclass.
 * @param  {function} ctor  A parent constructor.
 * @param  {function} sub   A subclass of the parent constructor.
 * @param  {?Object}  proto Optional. Properties added to the prototype of the
 *                          subclass.
 */
exports.inherits = function(sub, ctor, proto) {
  sub.prototype = Object.create(ctor.prototype);
  sub.prototype.constructor = sub;
  exports.extend(sub, ctor);
  proto && exports.extend(sub.prototype, proto); // jshint ignore:line
};

/**
 * Throws an Error with the supplied message.
 * @param  {String} msg An error message.
 * @throws {Error} When called.
 */
exports.thrower = function(msg) {
  throw new Error(msg);
};
