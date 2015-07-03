exports.noop = function() {};

exports.thrower = function(msg) {
  throw new Error(msg);
};

exports.nestPredicate = function(predicate) {
  return function(ifLambda, elseLambda) {
    return function(value) {
      return Promise.resolve(predicate(value)).then((function(res) {
        var lambda = res ? ifLambda : elseLambda;
        lambda && lambda.call(this, value);
      }).bind(this));
    };
  };
};
