var Listener = require('./Listener'),
	Node = require('./Node'),
	State = require('./State'),
	proto = require('./proto'),
	u = require('./utils');

function LaterList() {
	this._headRef = this._tail = new Node;
	this._state = new State;
	this.end = this.end.bind(this);
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
	this.push = this.end = u.thrower.bind(this, 'May not be called on an ended LaterList.');
	this._state.ended = true;
	this._state.error = err;
	err ? this.revive('end', err) : this.revive('close');
};

LaterList.prototype.link = function(onData) {
	var list = new this.constructor;
	return this.addListener(onData, list.end, list).value;
};

LaterList.prototype.close = function() {
	this.addListener = this.close = u.thrower.bind(this, 'May not be called on a closed LaterList.');
	this._headRef = null;
};

LaterList.prototype.consume = function(onData, initialValue) {
	var thisList = this;
	return new Promise(function(resolve, reject) {
		thisList.addListener(onData, function(err) {
			return err ? reject(err) : resolve(this.value);
		}, initialValue);
	});
};

LaterList.prototype.value = function() {
	var value = this.consume(Listener.prototype.push, []);
	this.value = u.constant(value);
	return value;
};

LaterList.from = function(from) {
	var listConstructor = this,
		list = new listConstructor,
	Promise.resolve(from.forEach(list.push, list)).then(list.end, list.end);
	return list;
};

LaterList.of = function() {
	var listConstructor = this,
		list = new listConstructor;
	Array.prototype.forEach.call(arguments, list.push, list);
	list.end();
	return list;
};

u.extend(LaterList.prototype, proto);

module.exports = LaterList;
