/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var LaterList = require('./LaterList'),
  RelayListener = require('./Listener').Relay,
  u = require('./utils');

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
