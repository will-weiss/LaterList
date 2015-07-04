var Node = require('./Node'),
	u = require('./utils'),
	lProto = require('./Listener').prototype;

exports.concat = function() {
	var lists = Array.prototype.slice.call(arguments);
	lists.unshift(this);
	return this.constructor.from(lists).link(function(list) {
		return list.forEach(this.push, this);
	});
};

exports.every = function(predicate, thisArg) {
	return this.consume(u.ternary(predicate.bind(thisArg), u.noop, function() {
		this.exit(false);
	}), true);
};

exports.filter = function(predicate, thisArg) {
	return this.link(u.ternary(predicate.bind(thisArg), lProto.push, u.noop));
};

exports.find = function(predicate, thisArg) {
	return this.consume(u.ternary(predicate.bind(thisArg), lProto.exit, u.noop));
};

exports.findIndex = function(predicate, thisArg) {
	return this.consume(u.ternary(predicate.bind(thisArg), function(value, index) {
		this.exit(index);
	}, u.noop), -1);
};

exports.forEach = function(lambda, thisArg) {
	return this.consume(lambda.bind(thisArg));
};

exports.includes = function(toMatch) {
	var fromIndex = parseInt(arguments[1], 10) || 0;
	return this.some(function(value, index) {
		return index >= fromIndex && (toMatch === value ||
			(toMatch !== toMatch && value !== value));
	});
};

exports.indexOf = function(toMatch) {
	return u.matchIndex.call(this, toMatch, lProto.exit);
};

exports.join = function(separator) {
	if (typeof separator === 'undefined')
		separator = ',';
	return this.reduce(function(accumulator, value, index) {
		return accumulator + (index ? separator : '') + value;
	}, '');
};

exports.lastIndexOf = function(toMatch) {
	return u.matchIndex.call(this, toMatch, lProto.set);
};

exports.map = function(lambda, thisArg) {
	return this.link(function(value, index) {
		return this.push(lambda.call(thisArg, value, index));
	});
};

exports.reduce = function(lambda, accumulator) {
	return this.consume(function(value, index) {
		this.set(Promise.resolve(this.value).then(function(accumulator) {
			return lambda(accumulator, value, index);
		}));
	}, accumulator);
};

exports.reduceRight = function(lambda, accumulator) {
	return this.reverse().then(function(reversedList) {
		var len = reversedList.length;
		return reversedList.reduce(function(accumulator, value, index) {
			return lambda(accumulator, value, len - index);
		}, accumulator);
	});
};

exports.reverse = function() {
	var forwardList = this,
		startLen = this.length;
	return this.consume(function(value, index) {
		var headRef = this.value._headRef,
			node = new Node(value, startLen - index);
		node.next = headRef.next;
		headRef.next = node;
	}, new this.constructor).then(function(reversedList) {
		var node, index,
			len = reversedList.length = forwardList.length;
		if (len - startLen) {
			index = 0;
			node = reversedList._headRef;
			while (node = node.next)
				node.index = index++;
		}
		reversedList.end();
		return reversedList;
	});
};

exports.slice = function(begin, end) {
	var start = (begin >= 0) ? parseInt(begin, 10) : 0,
		upTo = (end <= start) ? 0 : (parseInt(end, 10) || Infinity),
		size = upTo - start;
	if (size <= 0)
		return this.constructor.from([]);
	return this.filter(function(value, index) {
		if (index < start || index >= upTo)
			return false
		if (--size)
			return true;
		this.push(value);
		this.end();
	});
};

exports.some = function(predicate, thisArg) {
	return this.consume(u.ternary(predicate.bind(thisArg), function() {
		this.exit(true);
	}, u.noop), false);
};

exports.sort = function(compare) {
	return this.value().then((function(arr) {
		var clone = arr.slice(0);
		clone.sort(compare);
		return this.constructor.from(clone);
	}).bind(this));
};

exports.splice = function(begin, deleteCount) {
	var additions = Array.prototype.slice.call(arguments, 2),
		start = (begin >= 0) ? parseInt(begin, 10) : 0,
		upTo = start + (parseInt(deleteCount, 10) || 0);
	return this.filter(function(value, index) {
		if (index === upTo)
			additions.forEach(this.push, this);
		return index < start || index >= upTo;
	});
};
