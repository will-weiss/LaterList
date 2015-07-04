/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

function Node(value, index) {
  this.value = value;
  this.index = index;
  this.next = null;
}

module.exports = Node;
