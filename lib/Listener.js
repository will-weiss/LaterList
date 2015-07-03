var utils = require('./utils');

function Listener(laterList, onData, onEnd, initialValue) {
	this._state = laterList._state;
	this.node = laterList._headRef;
	this.onData = onData.bind(this);
	this.onEnd = onEnd.bind(this);
	this.value = initialValue;
	this.promise = Promise.resolve();
	this.pending = null;
	this.iter();
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

Listener.prototype.shift = function() {
	this.node = this.node.next;
	this.promise = Promise.resolve(this.node.value)
		.then(this.process.bind(this))
		.then(Promise.resolve.bind(Promise, this.promise), this.end.bind(this));
	this.after();
};

module.exports = Listener;
module.exports.subClass = utils.subClass.bind(null, Listener);
