/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

exports.constant = function(value) {
  return function() { return value; };
};

exports.extend = function(destination, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key))
      destination[key] = source[key];
  }
};

exports.locIndex = function(predicate, onMatch) {
  return this.consume(exports.ternary(predicate, function(value, index) {
    onMatch.call(this, index);
  }, exports.noop), -1);
};

exports.matchIndex = function(toMatch, onMatch) {
  return exports.locIndex.call(this, function(test) {
    return toMatch === test;
  }, onMatch);
};

exports.noop = function() {};

exports.subClass = function(ctor, sub, proto) {
  sub.prototype = Object.create(ctor.prototype);
  sub.prototype.constructor = sub;
  exports.extend(sub, ctor);
  return proto && exports.extend(sub.prototype, proto);
};

exports.ternary = function(predicate, ifLambda, elseLambda) {
  return function(value, index) {
    var listenerContext = this;
    return Promise.resolve(predicate(value, index))
      .then((function(res) {
        var lambda = res ? ifLambda : elseLambda;
        lambda.call(listenerContext, value, index);
      }));
  };
};

exports.thrower = function(msg) {
  throw new Error(msg);
};
