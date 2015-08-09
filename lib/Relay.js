/*
 * @fileOverview Defines Relay, a LaterList that respects order.
 * @module LaterList/Relay
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var LaterList = require('./interface'),
  RelayListener = require('./Listener').Relay,
  u = require('./utils');

/**
 * @classdesc A Relay is a LaterList for which order is preserved when listened
 * to.
 * @exports LaterList/Relay
 * @constructor
 * @augments LaterList
 */
function Relay() {
  LaterList.call(this);
}

u.inherits(Relay, LaterList, {
  /**
   * Adds a listener which processes values of this relay when all prior values
   * have been processed.
   * @param {function(*, Number)} onData       A function applied to each node.
   * @param {function(?Error)}    onEnd        A function to execute on end.
   * @param {*}                   initialValue An initial value.
   * @memberof LaterList/Relay.prototype
   */
  addListener: function(onData, onEnd, initialValue) {
    return new RelayListener(this, onData, onEnd, initialValue);
  }
});

module.exports = Relay;
