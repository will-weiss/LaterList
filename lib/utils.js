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

exports.endEarly = function(value) {
	this.value = value;
	this.end();
};

exports.subClass = function(from, sub, proto) {
	sub.prototype = Object.create(from.prototype);
	sub.prototype.constructor = sub;
	for (var key in (proto || {})) {
		if (proto.hasOwnProperty(key))
			sub.prototype[key] = proto[key];
	}
};
