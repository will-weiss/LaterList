exports.noop = function() {};

exports.thrower = function(msg) {
	throw new Error(msg);
};

exports.matchIndex = function(match, onMatch) {
	return function(value, index) {
		if (match === value)
			onMatch.call(this, index);
	};
};

exports.createTernary = function(predicate) {
	return function(ifLambda, elseLambda) {
		ifLambda = ifLambda || exports.noop;
		elseLambda = elseLambda || exports.noop;
		return function(value, index) {
			var listenerContext = this;
			return Promise.resolve(predicate.call(listenerContext, value, index)).then((function(res) {
				var lambda = res ? ifLambda : elseLambda;
				lambda.call(listenerContext, value, index);
			}));
		};
	};
};

exports.extend = function(destination, source) {
	for (var key in source) {
		if (source.hasOwnProperty(key))
			destination[key] = source[key];
	}
};

exports.subClass = function(ctor) {
	return function(sub, proto) {
		sub.prototype = Object.create(ctor.prototype);
		sub.prototype.constructor = sub;
		exports.extend(sub, ctor);
		proto && exports.extend(sub.prototype, proto);
	};
};
