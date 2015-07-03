var Listener = require('./Listener'),
	Node = require('./Node'),
	utils = require('./utils');

exports.concat = function() {
	var lists = Array.prototype.slice.call(arguments);
	lists.unshift(this);
	return this.constructor.from(lists).link(function(list) {
		return list.forEach(this.push.bind(this));
	});
};

exports.every = function(predicate) {
	return this.consume(utils.createTernary(predicate)(null, function() {
		this.exit(false);
	}), true);
};

exports.filter = function(predicate) {
	return this.link(utils.createTernary(predicate)(Listener.prototype.push));
};

exports.find = function(predicate) {
	return this.consume(utils.createTernary(predicate)(Listener.prototype.exit));
};

exports.forEach = function(lambda) {
	return this.consume(lambda);
};

exports.indexOf = function(match) {
	return this.consume(utils.matchIndex(match, Listener.prototype.exit), -1);
};

exports.join = function(separator) {
	separator = separator == null ? ',' : separator;
	return this.reduce(function(accumulator, value) {
		return accumulator ? accumulator + separator + value : value;
	}, '');
};

exports.lastIndexOf = function(match) {
	return this.consume(utils.matchIndex(match, Listener.prototype.set), -1);
};

exports.map = function(lambda) {
	return this.link(function(value, index) {
		return this.push(lambda(value, index));
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
	var list = new this.constructor,
		_headRef = list._headRef,
		startLen = this.length;
	return this.consume(function(value, index) {
		var node = new Node(value, startLen - index);
		node.next = _headRef.next;
		_headRef.next = node;
	}).then((function() {
		var node = _headRef,
			len = this.length,
			diff = len - startLen;
		list.length = len;
		if (diff) {
			while (node = node.next)
				node.index += diff;
		}
		list.end();
		return list;
	}).bind(this), list.end.bind(list));
};

exports.slice = function(begin, end) {
	var start = (begin >= 0) ? +begin : 0,
		upTo = (end <= start) ? 0 : (+end || Infinity),
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

exports.some = function(predicate) {
	return this.consume(utils.createTernary(predicate)(function() {
		this.exit(true);
	}), false);
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
		start = (begin >= 0) ? +begin : 0,
		upTo = start + (+deleteCount || 0);
	return this.filter(function(value, index) {
		if (index === upTo)
			additions.forEach(this.push, this);
		return index < start || index >= upTo;
	});
};
