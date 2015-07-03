var utils = require('./utils');

function Listener(list, onData, onEnd, initialValue) {
	this._state = list._state;
	this.node = list._headRef;
	this.promise = Promise.resolve();
	this.pending = null;
	this.onData = onData.bind(this);
	this.onEnd = onEnd.bind(this);
	this.set(initialValue);
	this.iter();
};

Listener.prototype.set = function(value) {
	this.value = value;
};

Listener.prototype.end = function(err) {
	this.iter = this.end = this.shift = utils.noop;
	this.onEnd(err);
};

Listener.prototype.pend = function() {
	var state = this._state;
	this.pending = state.pending;
	state.pending = this;
};

Listener.prototype.push = function(value) {
	this.value.push(value);
};

Listener.prototype.exit = function(value) {
	this.set(value);
	this.end();
};

Listener.prototype.close = function() {
	var end = this.end.bind(this);
	this.promise.then(end, end);
};

Listener.prototype.iter = function() {
	var state = this._state;
	return state.error ?
		this.end(state.error)
	: this.node.next ?
		this.shift()
	: state.ended ?
		this.close()
	: this.pend();
};

Listener.prototype.process = function(index, value) {
	return this.onData(value, index);
};

Listener.prototype.shift = function() {
	this.node = this.node.next;
	this.promise = Promise.resolve(this.node.value)
		.then(this.process.bind(this, this.node.index))
		.then(Promise.resolve.bind(Promise, this.promise), this.end.bind(this));
	this.after();
};

module.exports = Listener;
module.exports.subClass = utils.subClass(Listener);
