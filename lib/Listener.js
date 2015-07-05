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
 * Set the value of this listener.
 * @param {*} value A value.
 */
Listener.prototype.set = function(value) {
  this.value = value;
};

/**
 * Determine the next action for this listener to take based on the state of the
 * list and the nodes it has left to process.
 */
Listener.prototype.listen = function() {
  var state = this._state;
  // End immediately if the list has an error.
  return state.error ?
    this.end(state.error)
  // Shift to the next node if one exists.
  : this.node.next ?
    this.shift()
  // Close if the list has ended (without an error).
  : state.ended ?
    this.close()
  // Pend otherwise as new nodes may be pushed onto the list.
  : this.pend();
};

/**
 * Ends this this listener and passes an optional Error to the supplied onEnd
 * function. The other methods of this listener are overriden to perform no
 * operation to halt processing in place.
 * @param {?Error} err An optional error.
 */
Listener.prototype.end = function(err) {
  this.onData = this.set = this.listen = this.end = this.shift = this.close =
  this.pend = this.exit = this.push = this.setIndex = this.after = u.noop
  this.onEnd(err);
};

/**
 * Shift to the next node in the list and process it. Listening either resumes
 * immediately or after this node is processed, depending on this listener's
 * subclass.
 */
Listener.prototype.shift = function() {
  var node = this.node = this.node.next;
  // Processing is done processing of this node and prior nodes are done.
  this.done = Promise.resolve(node.value).then(function(value) {
    return this.onData(value, node.index);
  }).then(u.constant(this.done), this.end);
  // Call the after function implemented by this listener's subclass.
  this.after();
};

/**
 * End this listener when it is done processing all nodes.
 */
Listener.prototype.close = function() {
  this.done.then(this.end, this.end);
};

/**
 * Mark this listener as pending. Point to extant pending listeners of the same
 * list.
 */
Listener.prototype.pend = function() {
  var state = this._state;
  this.pending = state.pending;
  state.pending = this;
};

/**
 * Set the value of this listener and end without an error.
 * @param {*} value A value.
 */
Listener.prototype.exit = function(value) {
  this.set(value);
  this.end();
};

/**
 * Push a value onto the value of this listener.
 * @param {*} value A value.
 */
Listener.prototype.push = function(value) {
  this.value.push(value);
};

/**
 * Set a value at an index on the value of this listener.
 * @param {*}      value A value.
 * @param {Number} index An index.
 */
Listener.prototype.setIndex = function(value, index) {
  this.value[index] = value;
};

module.exports = Listener;
