/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

exports.extend = function(destination, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key))
      destination[key] = source[key];
  }
};

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

exports.locIndex = function(predicate, onMatch) {
  var onData = exports.fork(predicate, function(value, index) {
    onMatch.call(this, index);
  });
  return this.consume(onData, -1);
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


exports.thrower = function(msg) {
  throw new Error(msg);
};
