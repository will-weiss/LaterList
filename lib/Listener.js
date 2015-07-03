var utils = require('./utils');

function Listener(laterList, onData, onEnd, initialValue) {
	this._state = laterList._state;
	this.node = laterList._headRef;
	this.onData = onData.bind(this);
	this.onEnd = onEnd.bind(this);
	this.value = initialValue;
	this.pending = null;
	this.iter();
};

Listener.prototype.processing = 0;

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
	if (!this.processing)
		this.end();
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

Listener.prototype.decrement = function() {
	if (!(--this.processing) && this._state.ended)
		this.end();
};

Listener.prototype.process = function() {
	Promise.resolve(this.node.value).then(this.onData)
		.then(this.decrement.bind(this), this.end.bind(this));
	return this.iter();
};

Listener.prototype.shift = function() {
	this.processing++;
	this.node = this.node.next;
	return this.process();
};

module.exports = Listener;
