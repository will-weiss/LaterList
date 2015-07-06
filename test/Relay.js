/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	sinon = require("sinon"),
	sinonChai = require("sinon-chai"),
	Relay = require('../index').Relay;

var should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

if (!global.Promise)
	global.Promise = require('bluebird').Promise;

describe('Relay', function() {
	it('should be way cool', function() {
		var relay = new Relay();
		relay.push(1,2,3);
		relay.length.should.equal(3);
		var value = relay.value();
		relay.end();
		value.should.eventually.deep.equal([1,2,3]);
	});
	it('should have a concat method', function() {
		var relay = Relay.from([1,2,3]);
		var concatenated = relay.concat([4,5], 6, Relay.from([7,8,9]));
		concatenated.should.be.an.instanceof(Relay);
		concatenated.value().should.eventually.deep.equal([1,2,3,4,5,6,7,8,9]);
	});

});
