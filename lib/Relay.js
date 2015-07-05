/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var LaterList = require('./LaterList'),
  Listener = require('./Listener'),
  u = require('./utils');

/**
 * A RelayListener is a Listener for the Relay LaterList. Instances of
 * RelayListener ensure that all nodes are processed before listening for the
 * next node. As a result nodes are processed more slowly, but are resolved in
 * their original order.
 * @param {Relay}              relay        A relay to process.
 * @param {function(*,Number)} onData       A function applied to each node.
 * @param {function(?Error)}   onEnd        A function to execute on end.
 * @param {*}                  initialValue An initial value.
 * @constructor
 * @implements {Listener}
 */
function RelayListener(relay, onData, onEnd, initialValue) {
  Listener.call(this, relay, onData, onEnd, initialValue);
}

u.inherits(RelayListener, Listener, {
  /**
   * When all nodes are done processing, listen for the next node.
   * @lends {RelayListener.prototype}
   */
  after: function() {
    this.done.then(this.listen.bind(this));
  }
});

/**
 * A Relay is a LaterList for which order is preserved when listened to.
 * @constructor
 * @implements {LaterList}
 */
function Relay() {
  LaterList.call(this);
}

u.inherits(Relay, LaterList, {
  /**
   * Add a RelayListener to this Relay
   * @param {function(*, Number)} onData       A function applied to each node.
   * @param {function(?Error)}    onEnd        A function to execute on end.
   * @param {*}                   initialValue An initial value.
   * @lends {Relay.prototype}
   */
  addListener: function(onData, onEnd, initialValue) {
    return new RelayListener(this, onData, onEnd, initialValue);
  }
});

module.exports = Relay;
