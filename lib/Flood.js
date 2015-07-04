var LaterList = require('./LaterList'),
	Listener = require('./Listener'),
	u = require('./utils');

function FloodListener(flood, onData, onEnd, initialValue) {
	Listener.call(this, flood, onData, onEnd, initialValue);
};

u.subClass(Listener, FloodListener, {
	after: Listener.prototype.listen
});

function Flood() {
	LaterList.call(this);
};

u.subClass(LaterList, Flood, {
	addListener: function(onData, onEnd, initialValue) {
		return new FloodListener(this, onData, onEnd, initialValue);
	}
});

module.exports = Flood;
