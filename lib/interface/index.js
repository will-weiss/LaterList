/*
 * @fileOverview Defines the LaterList interface.
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var Node = require('./Node'),
  State = require('./State'),
  proto = require('./proto'),
  u = require('../utils'),
  lProto = require('../Listener').prototype,
  forEach = Array.prototype.forEach;

/**
 * @classdesc A LaterList is a linked list which may be used to process values
 * that arrive or are processed asynchronously.
 * @exports LaterList
 * @constructor
 */
function LaterList() {
  this._headRef = this._tail = new Node();
  this._state = new State();
  this.end = this.end.bind(this);
}

/**
 * Number of nodes in the list.
 * @type {Number}
 */
LaterList.prototype.length = 0;

/**
 * Adds a values to the list's tail. Pending listeners are revived and shifted.
 * @param  {...*} values The values to add to the end of the list.
 * @return {Number} The new length of the list.
 */
LaterList.prototype.push = function(/* values... */) {
  var i = -1, len = arguments.length;
  while (++i < len)
    this._tail = this._tail.next = new Node(arguments[i]);
  this.revive(lProto.shift);
  return this.length += len;
};

/**
 * Executes a Listener.prototype function on each pending listener.
 * @param  {Function} fn  A Listener.prototype function.
 * @param  {?Error}   err Optional. An error to pass to pending listeners.
 */
LaterList.prototype.revive = function(fn, err) {
  var next, state = this._state,
    // Reference the listener at the head of the stack of pending listeners.
    // This reference is null when there are no pending listeners.
    listener = state.pending;
  // Clear the stack of pending listeners.
  state.pending = null;
  // Iterate over the listeners that were pending when revive was initially
  // called. Once revived, listeners may pend immediately, setting themselves at
  // the head of this list's pending listeners.
  while (listener) {
    // Reference the next head of the initial stack of pending listeners. This
    // reference is null when this listener was last in the initial stack of
    // pending listeners.
    next = listener.pending;
    // Clear this listener's reference to the next pending listener.
    listener.pending = null;
    // Call the specified Listener.prototype function on the pending listener.
    fn.call(listener, err);
    // Reference the next listener to revive. The loop exits when this reference
    // is null.
    listener = next;
  }
  // Any listeners that were pending when revive was initially called have been
  // revived exactly once. The list will have a nonempty stack of pending
  // listeners for those that reach the tail of this list over the course of
  // this function call.
};

/**
 * Indicates that no more nodes will be added to the list. If an argument is
 * present it is interpreted as an error which will immediately end all
 * listeners. If no argument is present, listeners will end when they have
 * processed all nodes of the list. Subsequent calls of push and end on this
 * list will throw.
 * @param  {?error} err An optional error.
 */
LaterList.prototype.end = function(err) {
  // If there is an error end pending listeners, otherwise close them.
  var fn = err ? lProto.end : lProto.close;
  // Mark the state of the list as ended.
  this._state.ended = true;
  // Mark the error of the state.
  this._state.error = err;
  // Remove the reference to the tail of the list.
  this._tail = null;
  // Overwrite push and end to throw on subsequent calls.
  this.push = this.end = u.thrower.bind(this,
    'May not be called on an ended LaterList.');
  // Revive pending listeners with the proper function.
  this.revive(fn, err);
};

/**
 * Return a new LaterList instance whose nodes are the result of applying the
 * supplied onData function to each node of this list.
 * @param  {function(*,Number)} onData A function to process nodes of this list
 *                                     executed in the context of the listener.
 * @return LaterList A LaterList of the same subclass as this list.
 */
LaterList.prototype.link = function(onData) {
  var list = new this.constructor();
  return this.addListener(onData, list.end, list).value;
};

/**
 * Indicates that no more listeners will be added to this list. The reference to
 * the head of the list is removed so that nodes processed by each listener may
 * be garbage colllected. Subsequent calls of {@link LaterList#close},
 * {@link LaterList#atIndex} and adding of listeners on this list will throw as
 * these methods require a reference to the list's head.
 */
LaterList.prototype.close = function() {
  this.addListener = this.close = this.atIndex = u.thrower.bind(this,
    'May not be called on a closed LaterList.');
  this._headRef = null;
};

/**
 * Returns a promise that resolves with the final value of a listener.
 * @param  {function(*,Number)} onData A function to process nodes of this list
 *                                    executed in the context of the listener.
 * @param  {*} initialValue An initial value set on the listener.
 * @return {Promise<*>} The result of the computation of the listener.
 */
LaterList.prototype.consume = function(onData, initialValue) {
  var thisList = this;
  return new Promise(function(resolve, reject) {
    // Add a listener that resolves with its value on end.
    thisList.addListener(onData, function(err) {
      return err ? reject(err) : resolve(this.value);
    }, initialValue);
  });
};

/**
 * Collect the nodes of the list as an array.
 * @return {Promise<Array<*>>} Resolves with the values of the list's nodes.
 */
LaterList.prototype.value = function() {
  // Initialize an array with this list's current length. In most JS
  // environments, preallocating an array in this manner is slightly faster
  // as the array is never accessed prior to its 'holes' being filled in.
  var res = []; res.length = this.length;
  return this.consume(lProto.setIndex, res);
};

/**
 * Looks up the value of the node at the supplied index. Returns undefined if
 * the index is not a number or out of bounds.
 * @param  {Number} index An index of the list.
 * @return {*} The value of the node at that index.
 */
LaterList.prototype.atIndex = function(index) {
  var steps = parseInt(index, 10);
  // Return undefined if the supplied index is out of bounds.
  if (!(steps >= 0 && steps < this.length))
    return undefined;
  var node = this._headRef.next;
  // Walk a number of steps to arrive at the node of the supplied index.
  while (steps-- > 0)
    node = node.next;
  return node.value;
};

/**
 * Resolves with undefined if the list ends without error, rejects if the list
 * ends with an error.
 * @return {Promise}
 */
LaterList.prototype.when = function() {
  var when = this.consume(u.noop);
  // A list can only be ended once, so this is a constant.
  this.when = u.constant(when);
  return when;
};

/**
 * Creates a new LaterList instance from an list-like object with a forEach
 * method. The new list ends when the execution of forEach resolves.
 * @param  {Object.<{forEach: function}>} listLike An object to create a list
 *                                                 from.
 * @param  {?Function} mapFn  Optional. Map function to call on every element of
 *                            the list.
 * @param  {?Object}   thisArg Optional. Value to use as this when executing
 *                             mapFn.
 * @return LaterList An instance of LaterList whose nodes have values equal to
 *                     those of the supplied list-like.
 */
LaterList.from = function(listLike, mapFn, thisArg) {
  var list = new this();
  // Apply a map function over the supplied list-like if one is given.
  if (typeof mapFn === 'function')
    listLike = listLike.map(mapFn, thisArg);
  var res = listLike.forEach(u.pushOne, list);
  if (res)
    // If forEach returns a promise (as it does for LaterLists) wait for it to
    // resolve before ending the new list.
    Promise.resolve(res).then(list.end, list.end);
  else
    // Otherwise, end the list immediately.
    list.end();
  return list;
};

/**
 * Creates a new LaterList instance with a variable number of arguments.
 * @param {...*} values The values to add to a new list.
 * @return LaterList An instance of LaterList whose nodes have values equal to
 *                     those of the supplied arguments.
 */
LaterList.of = function(/* values */) {
  var list = new this();
  // Push each argument onto a new list,
  forEach.call(arguments, u.pushOne, list);
  // and end it.
  list.end();
  return list;
};

u.extend(LaterList.prototype, proto);

module.exports = LaterList;
