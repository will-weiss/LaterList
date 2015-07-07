/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var Node = require('./Node'),
  State = require('./State'),
  proto = require('./proto'),
  u = require('../utils'),
  lProto = require('../Listener').prototype,
  forEach = Array.prototype.forEach;

/**
 * A LaterList is a linked list which may be used to process values that arrive
 * asynchronously. As in many implementations of streams, listeners may be
 * added to instances of LaterList to process incoming values. There are
 * however some differences that make LaterList useful.
 *
 * <ul>
 *
 *   <li>  Familiar API: Array methods are implemented with an identical syntax.
 *         Methods that return or mutate arrays return LaterLists. Other methods
 *         wrap their return values in a Promise.
 *   </li>
 *   <li>  Preservation: Listeners will process a whole list even if they are
 *         added after values have been pushed onto the list. Data is never
 *         dropped.
 *   </li>
 *   </li>
 *   <li>  Indexing: Values are indexed by the order in which they are pushed.
 *   </li>
 *   <li>   Fully Asynchronous: A LaterList may be mapped, reduced, filtered,
 *          etc. using functions that return Promises. LaterLists process the
 *          resolved values of Promises pushed onto them.
 *   </li>
 *   <li>   Easy Chaining: Methods of LaterLists may be chained together. Values
 *          are passed along the chain even before the original list has ended
 *          and uncaught exceptions propogate down the chain.
 *   </li>
 *   <li>   Flexible: The two types of LaterLists - Flood and Relay - share an
 *          identical API but differ slightly in when their elements are
 *          processed. Elements of a Flood are processed as soon as they are
 *          available. Elements of a Relay are processed when processing of all
 *          prior elements is done. So, Floods have higher throughput while
 *          Relays preserve order, making each suitable for different contexts.
 *   </li>
 *   <li>   Unbounded: LaterLists may be pushed onto indefinitely without memory
 *          overload. When a LaterList is closed, adding new listeners is
 *          disabled so that elements processed by existing listeners may be
 *          garbage collected.
 *   </li>
 *   <li>   Active Listeners: Listeners of a LaterList are not simply callbacks;
 *          they are their own class and maintain state. As listeners keep a
 *          reference to their unprocessed elements, values may be pushed onto a
 *          LaterList more quickly than they are processed without needing to
 *          worry about backpressure for all but the most memory-intensive
 *          applications.
 *   </li>
 *   <li>   Lightweight: LaterList has a minimal codebase and no dependencies
 *          relying only on a JS environment that supports the Promise/A+
 *          specification.
 *   </li>
 * </ul>
 *
 * @interface
 */
function LaterList() {
  this._headRef = this._tail = new Node(null, -1);
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
    this._tail = this._tail.next = new Node(arguments[i], this.length++);
  this.revive(lProto.shift);
  return this.length;
};

/**
 * Executes a Listener.prototype function on each pending listener.
 * @param  {Function} fn  A Listener.prototype function.
 * @param  {?Error}   err Optional. An error to pass to pending listeners.
 */
LaterList.prototype.revive = function(fn, err) {
  var next, pending = this._state.pending;
  this._state.pending = null;
  while (pending) {
    next = pending.pending;
    pending.pending = null;
    fn.call(pending, err);
    pending = next;
  }
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
  var fn = err ? lProto.end : lProto.close;
  this._state.ended = true;
  this._state.error = err;
  this.push = this.end = u.thrower.bind(this,
    'May not be called on an ended LaterList.');
  this.revive(fn, err);
};

/**
 * Return a new LaterList instance whose nodes are the result of applying the
 * supplied onData function to each node of this list.
 * @param  {function(*,Number)} onData A function to process nodes of this list
 *                                     executed in the context of the listener.
 * @return {LaterList} A LaterList of the same subclass as this list.
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
  var node, steps = parseInt(index, 10);
  if (!(steps >= 0 && steps < this.length))
    return undefined;
  node = this._headRef.next;
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
 * @param  {[type]} mapFn   Optional. Map function to call on every element of
 *                          the list.
 * @param  {[type]} thisArg Optional. Value to use as this when executing mapFn.
 * @return {LaterList} An instance of LaterList whose nodes have values equal to
 *                     those of the supplied list-like.
 */
LaterList.from = function(listLike, mapFn, thisArg) {
  var list = new this();
  if (typeof mapFn === 'function')
    listLike = listLike.map(mapFn, thisArg);
  var res = listLike.forEach(u.pushOne, list);
  if (res)
    Promise.resolve(res).then(list.end, list.end);
  else
    list.end();
  return list;
};

/**
 * Creates a new LaterList instance with a variable number of arguments.
 * @param {...*} values The values to add to a new list.
 * @return {LaterList} An instance of LaterList whose nodes have values equal to
 *                     those of the supplied arguments.
 */
LaterList.of = function(/* values */) {
  var list = new this();
  forEach.call(arguments, u.pushOne, list);
  list.end();
  return list;
};

u.extend(LaterList.prototype, proto);

module.exports = LaterList;
