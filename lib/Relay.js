var LaterList = require('./LaterList'),
  Listener = require('./Listener');

function RelayListener(relay, onData, onEnd, initialValue) {
  Listener.call(this, relay, onData, onEnd, initialValue);
};

Listener.subClass(RelayListener, {
  after: function() {
    this.promise.then(this.iter.bind(this));
  }
});

function Relay() {
  LaterList.call(this);
};

LaterList.subClass(Relay, {
  addListener: function(onData, onEnd, initialValue) {
    return new RelayListener(this, onData, onEnd, initialValue);
  }
});

module.exports = Relay;
