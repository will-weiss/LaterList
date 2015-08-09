/*
 * @fileOverview Defines Flood, a LaterList with immediate processing.
 * @module LaterList/Flood
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var LaterList = require('./interface'),
  FloodListener = require('./Listener').Flood,
  u = require('./utils');

/**
 * @classdesc A Flood is a LaterList for which values are processed immediately.
 * @exports LaterList/Flood
 * @constructor
 * @augments LaterList
 */
function Flood() {
  LaterList.call(this);
}

u.inherits(Flood, LaterList, {
  /**
   * Adds a listener which processes values of this flood as soon as they
   * arrive.
   * @param {function(*, Number)} onData       A function applied to each node.
   * @param {function(?Error)}    onEnd        A function to execute on end.
   * @param {*}                   initialValue An initial value.
   * @memberof LaterList/Flood.prototype
   */
  addListener: function (onData, onEnd, initialValue) {
    return new FloodListener(this, onData, onEnd, initialValue);
  }
});

module.exports = Flood;

