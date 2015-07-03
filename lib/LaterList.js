var State = require('./State'),
	utils = require('./utils');

function LaterList() {
	this._headRef = this._tail = this._create();
	this._state = new State;
};

LaterList.from = function(from) {
	var list = new this.constructor,
		end = list.end.bind(list);
	Promise.resolve()
		.then(from.forEach.bind(from, list.push, list))
		.then(end, end);
	return list;
};

LaterList.prototype._push = function(node) {
	this._tail = this._tail.next = node;
	this.revive('shift');
};

LaterList.prototype.push = function() {
	this._push(this._create.apply(this, arguments));
};

LaterList.prototype.value = function() {
	var value = this.consume(function(value) {
		this.value.push(value);
	}, []);
	this.value = function() { return value; };
	return value;
};

LaterList.prototype.revive = function(fn, arg) {
	var pending, check = this._state;
	while (pending = check.pending) {
		check.pending = null;
		pending[fn](arg);
		check = pending;
	}
};

LaterList.prototype.listen = function(onData, onEnd, initialValue) {
	return new this.Listener(this, onData, onEnd, initialValue);
};

LaterList.prototype.end = function(err) {
	this.push = this.end = utils.thrower.bind(this, 'May not be called on an ended laterList.');
	this._state.ended = true;
	this._state.error = err;
	err ? this.revive('end', err) : this.revive('close');
};

LaterList.prototype.close = function() {
	this.listen = this.close = utils.thrower.bind(this, 'May not be called on a closed laterList.');
	this._headRef = null;
};

LaterList.prototype.link = function(withPush) {
	var laterList = new this.constructor;
	return this.listen(withPush(laterList.push.bind(laterList)), laterList.end.bind(laterList), laterList).value;
};

LaterList.prototype.consume = function(onData, initialValue) {
	return new Promise((function(resolve, reject) {
		this.listen(onData, function(err) {
			return err ? reject(err) : resolve(this.value);
		}, initialValue);
	}).bind(this));
};

LaterList.prototype.forEach = function(lambda) {
	return this.consume(lambda);
};

LaterList.prototype.map = function(lambda) {
	return this.link(function(push) {
		return function() {
			return push(lambda.apply(this, arguments));
		};
	});
};

LaterList.prototype.filter = function(predicate) {
	return this.link(utils.nestPredicate(predicate));
};

LaterList.prototype.find = function(predicate) {
	return this.consume(utils.nestPredicate(predicate)(utils.endEarly));
};

LaterList.prototype.every = function(predicate) {
	return this.consume(utils.nestPredicate(predicate)(null, utils.endEarly.bind(null, false)), true);
};

LaterList.prototype.some = function(predicate) {
	return this.consume(utils.nestPredicate(predicate)(utils.endEarly.bind(null, true)), false);
};

LaterList.prototype.reduce = function(lambda, accumulator) {
	return this.consume(function() {
		var args = Array.prototype.slice.call(arguments);
		this.value = Promise.resolve(this.value).then(function(accumulator) {
			args.unshift(accumulator);
			return lambda.apply(this, args);
		});
	}, accumulator);
};

LaterList.prototype.join = function(separator) {
	return this.reduce(function(accumulator, value) {
		return accumulator + separator + value;
	}, '');
};

LaterList.prototype.flatten = function() {
	return this.link(function(push) {
		return function(obj) {
			return LaterList.from(obj).consume(push);
		};
	});
};

LaterList.prototype.concat = function(obj) {
	return LaterList.from([this, obj]).flatten();
};

module.exports = LaterList;
module.exports.subClass = utils.subClass.bind(null, LaterList);
