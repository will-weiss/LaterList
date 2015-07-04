var u = require('./utils');

function Listener(list, onData, onEnd, initialValue) {
  this._state = list._state;
  this.node = list._headRef;
  this.onData = onData.bind(this);
  this.onEnd = onEnd.bind(this);
  this.set(initialValue);
  this.done = Promise.resolve();
  this.pending = null;
  this.end = this.end.bind(this);
  this.listen();
}

Listener.prototype.listen = function() {
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
  var node = this.node = this.node.next;
  this.done = Promise.resolve(node.value)
    .then((function(value) {
      return this.onData(value, node.index);
    }).bind(this))
    .then(u.constant(this.done), this.end);
  this.after();
};

Listener.prototype.set = function(value) {
  this.value = value;
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
  this.done.then(this.end, this.end);
};

Listener.prototype.end = function(err) {
  this.listen = this.shift = this.set = this.pend =
    this.push = this.exit = this.close = this.end = u.noop;
  this.onEnd(err);
};

module.exports = Listener;
