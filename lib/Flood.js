var LaterList = require('./LaterList'),
  Listener = require('./Listener');

function FloodListener(flood, onData, onEnd, initialValue) {
  Listener.call(this, flood, onData, onEnd, initialValue);
};

Listener.subClass(FloodListener, {
  after: Listener.prototype.iter
});

function Flood() {
  LaterList.call(this);
};

LaterList.subClass(Flood, {
  addListener: function(onData, onEnd, initialValue) {
    return new FloodListener(this, onData, onEnd, initialValue);
  }
});

module.exports = Flood;
