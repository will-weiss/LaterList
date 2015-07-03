utils = require('./utils');

function Node(value, index) {
	this.value = value;
  this.index = index;
  this.next = null;
};

function IndexedNode(value, index) {
  Node.call(this, value);
};

utils.subClass(Node, IndexedNode);

module.exports = Node;
module.exports.Indexed = IndexedNode;
