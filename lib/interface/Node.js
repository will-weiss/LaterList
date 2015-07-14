/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

/**
 * A Node is an indexed value in a LaterList with a reference to the next Node
 * which is initially null.
 * @param {*}      value The value of the node.
 * @constructor
 * @private
 */
function Node(value, index) {
  this.value = value;
  this.next = null;
}

module.exports = Node;
