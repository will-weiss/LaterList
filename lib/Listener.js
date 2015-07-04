/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var u = require('./utils');

/**
 * The Listener processes nodes in a LaterList. A listener is pending if it has
 * processed all extant nodes in a list that has not ended. A listener calls its
 * onEnd function with an error if the list has an error, or if the listener's
 * computation results in an error. If there are no errors, the listener calls
 * its onEnd function with no arguments when it has processed all extant nodes
 * in a list that has ended.
 * @param {LaterList}          list         A list to process.
 * @param {function(*,Number)} onData       A function applied to each node.
 * @param {function(?Error)}   onEnd        A function to execute on end.
 * @param {*}                  initialValue An initial value.
 * @interface
 */
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

/**
 * Called between processes, determines the next action to take.
 */
Listener.prototype.listen = function() {
  var state = this._state;
  // End immediately on an error
  return state.error ?
    this.end(state.error)
  // Shift to the next node if one exists
  : this.node.next ?
    this.shift()
  // Close if the list has ended
  : state.ended ?
    this.close()
  // Pend otherwise as new nodes may be pushed onto the list
  : this.pend();
};

/**
 * Shift to the next node in the list and process it. Call the after function
 * implemented by subclasses of Listener.
 */
Listener.prototype.shift = function() {
  var node = this.node = this.node.next;
  this.done = Promise.resolve(node.value)
    .then((function(value) {
      return this.onData(value, node.index);
    }).bind(this))
    .then(u.constant(this.done), this.end);
  this.after();
};

/**
 * Set the value of a Listener
 * @param {*} value A value
 */
Listener.prototype.set = function(value) {
  this.value = value;
};

/**
 * Mark a Listener as pending. Extant pending listeners of the same list are
 * referenced by this listener.
 */
Listener.prototype.pend = function() {
  var state = this._state;
  this.pending = state.pending;
  state.pending = this;
};

/**
 * Push a value onto the value of the listener.
 * @param  {*} value A value.
 */
Listener.prototype.push = function(value) {
  this.value.push(value);
};

/**
 * Set the value of a Listener and end without an error.
 * @param  {*} value A value.
 */
Listener.prototype.exit = function(value) {
  this.set(value);
  this.end();
};

/**
 * End the listener when it is done processing all nodes.
 */
Listener.prototype.close = function() {
  this.done.then(this.end, this.end);
};

/**
 * End all processing of the listener and pass an optional Error to the supplied
 * onEnd function. Subsequent calls to methods of this listener result in no
 * operation.
 * @param  {?Error} err An optional error.
 */
Listener.prototype.end = function(err) {
  this.listen = this.shift = this.set = this.pend =
    this.push = this.exit = this.close = this.end = u.noop;
  this.onEnd(err);
};

module.exports = Listener;
