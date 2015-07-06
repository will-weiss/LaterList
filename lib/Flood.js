/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var LaterList = require('./LaterList'),
  FloodListener = require('./Listener').Flood,
  u = require('./utils');

/**
 * A Flood is a LaterList for which order is not preserved when listened to.
 * @constructor
 * @implements {LaterList}
 */
function Flood() {
  LaterList.call(this);
}

u.inherits(Flood, LaterList, {
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
