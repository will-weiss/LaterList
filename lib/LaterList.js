var Listener = require('./Listener'),
	Node = require('./Node'),
	State = require('./State'),
	utils = require('./utils'),
	proto = require('./proto');

function LaterList() {
	this._headRef = this._tail = new Node;
	this._state = new State;
};

LaterList.prototype.length = 0;

LaterList.prototype.push = function(value) {
	this._tail = this._tail.next = new Node(value, this.length++);
	this.revive('shift');
};

LaterList.prototype.revive = function(fn, arg) {
	var pending, check = this._state;
	while (pending = check.pending) {
		check.pending = null;
		pending[fn](arg);
		check = pending;
	}
};

LaterList.prototype.end = function(err) {
	this.push = this.end = utils.thrower.bind(this, 'May not be called on an ended LaterList.');
	this._state.ended = true;
	this._state.error = err;
	err ? this.revive('end', err) : this.revive('close');
};

LaterList.prototype.link = function(onData) {
	var list = new this.constructor;
	return this.addListener(onData, list.end.bind(list), list).value;
};

LaterList.prototype.close = function() {
	this.addListener = this.close = utils.thrower.bind(this, 'May not be called on a closed LaterList.');
	this._headRef = null;
};

LaterList.prototype.consume = function(onData, initialValue) {
	return new Promise((function(resolve, reject) {
		this.addListener(onData, function(err) {
			return err ? reject(err) : resolve(this.value);
		}, initialValue);
	}).bind(this));
};

LaterList.prototype.value = function() {
	var value = this.consume(Listener.prototype.push, []);
	this.value = function() { return value; };
	return value;
};

LaterList.from = function(from) {
	var list = new this;
		end = list.end.bind(list),
		res = from.forEach(list.push.bind(list));
	res ? Promise.resolve(res).then(end, end) : end();
	return list;
};

utils.extend(LaterList.prototype, proto);

module.exports = LaterList;
module.exports.subClass = utils.subClass(LaterList);
