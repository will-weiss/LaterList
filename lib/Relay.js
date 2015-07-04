var LaterList = require('./LaterList'),
	Listener = require('./Listener'),
	u = require('./utils');

function RelayListener(relay, onData, onEnd, initialValue) {
	Listener.call(this, relay, onData, onEnd, initialValue);
};

u.subClass(Listener, RelayListener, {
	after: function() {
		this.done.then(this.listen.bind(this));
	}
});

function Relay() {
	LaterList.call(this);
};

u.subClass(LaterList, Relay, {
	addListener: function(onData, onEnd, initialValue) {
		return new RelayListener(this, onData, onEnd, initialValue);
	}
});

module.exports = Relay;
