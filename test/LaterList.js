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

describe('LaterList', function() {
	beforeEach(function() {
	});
	afterEach(function() {
	});
	describe('Interface', function() {
		beforeEach(function() {
			LaterList.prototype.addListener = function() {
				return {};
			};
		});
		it('should have a link method', function() {
			var list = LaterList.from([1,2,3]);
			addListenerSpy = sinon.spy(list, 'addListener');
			addListenerSpy.callCount.should.equal(0);
			list.link(u.noop);
			addListenerSpy.callCount.should.equal(1);
			var args = addListenerSpy.firstCall.args;
			args.should.have.length(3);
			args[0].should.equal(u.noop);
			args[1].should.equal(args[2].end);
			args[2].should.be.an.instanceof(LaterList);
		});
		it('should have a close method', function() {
			var list = LaterList.from([1,2,3]);
			list._headRef.should.exist;
			list.close();
			should.not.exist(list._headRef);
			list.addListener.should.throw();
			list.close.should.throw();
			list.atIndex.should.throw();
		});
		describe('consume', function() {
			it('should resolve', function() {
				LaterList.prototype.addListener = function(onData, onErr, initialValue) {
					onErr.call({value: initialValue});
				};
				var list = LaterList.from([1,2,3]);
				return list.consume(u.noop, 5).should.eventually.become(5);
			});
			it('should reject', function() {
				LaterList.prototype.addListener = function(onData, onErr, initialValue) {
					onErr.call({value: initialValue}, new Error());
				};
				var list = LaterList.from([1,2,3]);
				return list.consume(u.noop, 5).should.eventually.be.rejected;
			});
		});
		it('should collect its value', function() {
			var list = LaterList.from([1,2,3]);
			var consumeSpy = sinon.spy(list, 'consume');
			list.value();
			consumeSpy.callCount.should.equal(1);
			var args = consumeSpy.firstCall.args;
			args[0].should.equal(Listener.prototype.setIndex);
			args[1].should.deep.equal(Array(3));
		});
		it('should get a value at an index', function() {
			var list = LaterList.from([1,2,3]);
			should.not.exist(list.atIndex(-1));
			list.atIndex(0).should.equal(1);
			list.atIndex(1).should.equal(2);
			list.atIndex(2).should.equal(3);
			should.not.exist(list.atIndex(3));
		});
		it('should make a list of values', function() {
			var list = LaterList.of(1,2,3);
			should.not.exist(list.atIndex(-1));
			list.atIndex(0).should.equal(1);
			list.atIndex(1).should.equal(2);
			list.atIndex(2).should.equal(3);
			should.not.exist(list.atIndex(3));
		});
	});
});
