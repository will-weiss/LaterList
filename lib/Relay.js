var LaterList = require('./LaterList'),
  Listener = require('./Listener'),
  Node = require('./Node'),
  utils = require('./utils');

function RelayListener() {
  Listener.apply(this, arguments);
};

Listener.subClass(RelayListener, {
  process: function(value) {
    return this.onData(value, this.node.index);
  },
  after: function() {
    this.promise.then(this.iter.bind(this));
  }
});

function Relay() {
  LaterList.call(this);
};

LaterList.subClass(Relay, {
  Listener: RelayListener,
  _create: function(value) {
    return new Node.Indexed(value, this.length++);
  },
  length: -1
});

module.exports = Relay;
