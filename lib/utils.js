/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

/**
 * Returns a function that returns a constant value.
 * @param  {*} value A value.
 * @private
 * @return {Function} A nullary function that returns a contant value.
 */
exports.constant = function(value) {
  return function() { return value; };
};

/**
 * Copies keys from a source object to a destination object.
 * @param  {Object} destination An object.
 * @param  {Object} source      An object.
 * @private
 */
exports.extend = function(destination, source) {
  for (var key in source)
    destination[key] = source[key];
};

/**
 * Dummy function to stand in for other functions. Performs no operation.
 * @private
 */
exports.noop = function() {};

/**
 * Pushes a single value onto whatever it is bound to.
 * @param {*} value A value.
 * @private
 */
exports.pushOne = function(value) {
  this.push(value);
};

/**
 * Adds methods from a constructor and its prototype to a subclass. Properties
 * of an optional third argument are added to the subclass.
 * @param  {function} ctor  A parent constructor.
 * @param  {function} sub   A subclass of the parent constructor.
 * @param  {?Object}  proto Optional. Properties added to the prototype of the
 *                          subclass.
 *                          @private
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
 * @private
 */
exports.thrower = function(msg) {
  throw new Error(msg);
};
