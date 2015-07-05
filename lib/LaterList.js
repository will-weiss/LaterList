/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var Node = require('./Node'),
  State = require('./State'),
  proto = require('./proto'),
  u = require('./utils'),
  lProto = require('./Listener').prototype,
  forEach = Array.prototype.forEach;

/**
 * A LaterList is a linked list which may be used to process values that arrive
 * asynchronously. As in many implementations of streams, listeners may be
 * added to instances of LaterList to process incoming values. There are
 * however some key differences:
 *
 *   - Familiar API: Array methods are implemented with an identical syntax.
 *     Methods that return or mutate arrays return LaterLists. Other methods
 *     wrap their return values in a Promise.
 *
 *   - Preservation: Listeners will process a whole list even if they are added
 *     after values have been pushed onto the list. Data is never dropped.
 *
 *   - Indexing: Values are indexed by the order in which they are pushed.
 *
 *   - Asynchronous chaining: A LaterList may be mapped, reduced, filtered, etc.
 *     using functions that return Promises. LaterLists process the resolved
 *     values of Promises pushed onto them.
 *
 *   - Lightweight: LaterList has a minimal codebase and no dependencies relying
 *     only on a JS environment that supports the Promise/A+ specification.
 *
 *   - No magic:
 *     Lists may be closed,
 *     after which no new listeners may be added and all nodes processed by all
 *     listeners are garbage collected.
 *
 * Almost all ES5 Array.prototype methods are implemented as LaterList methods.
 * The exceptions (shift, pop, and unshift) are left out because they mutate the
 * existing values in the list, which may invalidate extant listeners. Methods
 * that mutate Arrays in place (sort, reverse, splice) instead return new
 * LaterLists.
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
 */
LaterList.prototype.push = function(/* values... */) {
  var i = -1, len = arguments.length;
  while (++i < len)
    this._tail = this._tail.push(arguments[i]);
  this.length = this._tail.index;
  this.revive(lProto.shift);
};

/**
 * Executes a Listener.prototype function on each pending listener.
 * @param  {Function} fn  A Listener.prototype function.
 * @param  {?Error}   err Optional. An error to pass to pending listeners.
 */
LaterList.prototype.revive = function(fn, err) {
  var pending, check = this._state;
  while (pending = check.pending) { // jshint ignore:line
    check.pending = null;
    fn.call(pending, err);
    check = pending;
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
 * be garbage colllected. Subsequent calls of addListener, close, and atIndex on
 * this list will throw as these methods require a reference to the list's head.
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
 * Creates a new LaterList instance from an list-like object with a forEach
 * method. The new list ends when the execution of forEach resolves.
 * @param  {Object.<{forEach: function}>} from An object to create a list from.
 * @return {LaterList} An instance of LaterList whose nodes have values equal to
 *                     those of the supplied list-like.
 */
LaterList.from = function(from) {
  var list = new this();
  Promise.resolve(from.forEach(list.push, list)).then(list.end, list.end);
  return list;
};

/**
 * Creates a new LaterList instance with a variable number of arguments.
 * @return {LaterList} An instance of LaterList whose nodes have values equal to
 *                     those of the supplied arguments.
 */
LaterList.of = function() {
  var list = new this();
  forEach.call(arguments, list.push, list);
  list.end();
  return list;
};

u.extend(LaterList.prototype, proto);

module.exports = LaterList;
