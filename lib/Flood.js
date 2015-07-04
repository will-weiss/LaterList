/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var LaterList = require('./LaterList'),
  Listener = require('./Listener'),
  u = require('./utils');

/**
 * A FloodListener is a Listener for the Flood LaterList. Instances of
 * FloodListener do not wait for nodes to finish processing before listening for
 * new nodes. As a result nodes are processed more quickly, but may not resolve
 * in their original order.
 * @param {Flood}              flood        A flood to process.
 * @param {function(*,Number)} onData       A function applied to each node.
 * @param {function(?Error)}   onEnd        A function to execute on end.
 * @param {*}                  initialValue An initial value.
 * @constructor
 * @implements {Listener}
 */
function FloodListener(flood, onData, onEnd, initialValue) {
  Listener.call(this, flood, onData, onEnd, initialValue);
}

u.subClass(Listener, FloodListener, {
  /**
   * Listen for the next node immediately after processing has commenced on the
   * previous node.
   * @lends {FloodListener.prototype}
   */
  after: Listener.prototype.listen
});

/**
 * A Flood is a LaterList for which order is not preserved when listened to.
 * @constructor
 * @implements {LaterList}
 */
function Flood() {
  LaterList.call(this);
}

u.subClass(LaterList, Flood, {
  /**
   * Add a FloodListener to this Flood
   * @param {function(*, Number)} onData       A function applied to each node.
   * @param {function(?Error)}    onEnd        A function to execute on end.
   * @param {*}                   initialValue An initial value.
   * @lends {Flood.prototype}
   */
  addListener: function (onData, onEnd, initialValue) {
    return new FloodListener(this, onData, onEnd, initialValue);
  }
});

module.exports = Flood;
