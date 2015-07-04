exports.constant = function(value) {
	return function() { return value; };
};

exports.extend = function(destination, source) {
	for (var key in source) {
		if (source.hasOwnProperty(key))
			destination[key] = source[key];
	}
};

exports.matchIndex = function(toMatch, onMatch) {
	return this.consume(function(value, index) {
		if (toMatch === value)
			onMatch.call(this, value, index);
	}, -1);
};

exports.noop = function() {};

exports.subClass = function(ctor, sub, proto) {
	sub.prototype = Object.create(ctor.prototype);
	sub.prototype.constructor = sub;
	exports.extend(sub, ctor);
	proto && exports.extend(sub.prototype, proto);
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
