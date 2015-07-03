var LaterList = require('./LaterList'),
  Listener = require('./Listener'),
  Node = require('./Node'),
  utils = require('./utils');

function FloodListener() {
  Listener.apply(this, arguments);
};

Listener.subClass(FloodListener, {
  process: function(value) {
    return this.onData(value);
  },
  after: function() {
    this.iter();
  }
});

function Flood() {
  LaterList.call(this);
};

LaterList.subClass(Flood, {
  Listener: FloodListener,
  _create: function(value) {
    return new Node(value);
  }
});

module.exports = Flood;
