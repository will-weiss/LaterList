/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	sinon = require("sinon"),
	sinonChai = require("sinon-chai"),
	u = require('../lib/utils'),
	State = require('../lib/State'),
	Node = require('../lib/Node'),
	LaterList = require('../lib/LaterList'),
	Listener = require('../lib/Listener');

var should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

if (!global.Promise)
	global.Promise = require('bluebird').Promise;

describe('Listener', function() {
	var list;
	beforeEach(function() {
		list = LaterList.from([1,2,3]);
	});
	describe('Interface', function() {
		var listener, listen;
		beforeEach(function() {
			Listener.prototype.after = u.noop;
			listen = Listener.prototype.listen;
			Listener.prototype.listen = u.noop;
			listener = new Listener(list, u.noop, u.noop, 5);
		});
		afterEach(function() {
			Listener.prototype.listen = listen;
		});
		it('should set proper initial values', function() {
			listener._state.should.equal(list._state);
			listener.node.should.equal(list._headRef);
			listener.value.should.equal(5);
		});
		it('should set a value', function() {
			listener.set(7);
			listener.value.should.equal(7);
		});
		it('should override its methods on end', function() {
			listener.end();
			listener.onData.should.equal(u.noop);
			listener.set.should.equal(u.noop);
			listener.listen.should.equal(u.noop);
			listener.end.should.equal(u.noop);
			listener.shift.should.equal(u.noop);
			listener.close.should.equal(u.noop);
			listener.pend.should.equal(u.noop);
			listener.exit.should.equal(u.noop);
			listener.push.should.equal(u.noop);
			listener.setIndex.should.equal(u.noop);
			listener.after.should.equal(u.noop);
		});
		it('should call its onEnd method on end', function() {
			var onEndSpy = sinon.spy(listener, "onEnd");
			listener.end(42);
			onEndSpy.should.have.been.calledWith(42);
		});
		it('should shift nodes', function() {
			[1,2,3].forEach(function(value, index) {
				listener.shift();
				listener.node.value.should.equal(value);
				listener.node.index.should.equal(index);
			});
		});
		it('should close', function() {
			var endSpy = sinon.spy(listener, "end");
			return listener.close().then(function() {
				return endSpy.should.have.been.calledWithExactly(undefined);
			});
		});
		it('should pend', function() {
			var otherListener = new Listener(list, u.noop, u.noop);
			otherListener.pend();
			listener.pend();
			list._state.pending.should.equal(listener);
			listener.pending.should.equal(otherListener);
			should.not.exist(otherListener.pending);
		});
		it('should exit with a value', function() {
			var end = sinon.spy(listener, "end");
			listener.exit(6);
			listener.value.should.equal(6);
			end.should.have.been.calledWithExactly();
		});
		it('should push a value onto its value', function() {
			listener.value = [];
			listener.push(6);
			listener.value.should.deep.equal([6]);
		});
		it('should set a value at an index on its value', function() {
			listener.value = [1,2,3];
			listener.setIndex(4, 3);
			listener.value.should.deep.equal([1,2,3,4]);
		});
	});
	describe('listen', function() {
		it('should call error when the list has an error', function() {
			var called, calledArgs, list = new LaterList();
			var fns = {
				onData: function() {
					called = 'onData';
					calledArgs = Array.prototype.slice.call(arguments);
				},
				onEnd: function() {
					called = 'onEnd';
					calledArgs = Array.prototype.slice.call(arguments);
				}
			};
			var myError = new Error();
			list.end(myError);
			var listener = new Listener(list, fns.onData, fns.onEnd);
			called.should.equal('onEnd');
			calledArgs.should.deep.equal([myError]);
		});
		it('should shift when there is a next node', function() {
			var list = new LaterList();
			list.push(4);
			var listener = new Listener(list, u.noop, u.noop);
			listener.node.value.should.equal(4);
		});
		it('should close when the state has ended without an error', function() {
			var list = new LaterList();
			list.end();
			var listener = new Listener(list, u.noop, function() {
				this.value = 5;
			});
			should.not.exist(listener.pending);
			return listener.done.then(function() {
				listener.value.should.equal(5);
			});
		});
		it('should pend when the list has not ended and there are no ' +
			 'nodes to process', function() {
			var list = new LaterList();
			var listener = new Listener(list, u.noop, u.noop);
			list._state.pending.should.equal(listener);
		});
	});
});
