/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

/**
 * A Node is an indexed value in a LaterList with a reference to the next Node
 * which is initially null.
 * @param {*} value The value of the node.
 * @param {Number} index The index of the node in the list.
 * @constructor
 */
function Node(value, index) {
  this.value = value;
  this.index = index;
  this.next = null;
}

/**
 * Set the next node with a supplied value and an incremented index.
 * @param  {*} value A value for the next node.
 * @return {Node} The next node.
 */
Node.prototype.push = function(value) {
  return this.next = new Node(value, this.index + 1);
};

module.exports = Node;
