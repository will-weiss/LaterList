exports.noop = function() {};

exports.thrower = function(msg) {
	throw new Error(msg);
};

exports.nestPredicate = function(predicate) {
	return function(ifLambda, elseLambda) {
		return function() {
			var args = arguments;
			return Promise.resolve(predicate.apply(this, args)).then((function(res) {
				var lambda = res ? ifLambda : elseLambda;
				lambda && lambda.apply(this, args);
			}).bind(this));
		};
	};
};
