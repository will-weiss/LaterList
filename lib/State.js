/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

/**
 * State holds attributes of a LaterList and is accessed by its Listeners to
 * determine its state. Initially a LaterList is not ended, has no error, and
 * has no pending Listener.
 * @constructor
 */
function State() {
  this.ended = false;
  this.error = null;
  this.pending = null;
}

module.exports = State;
