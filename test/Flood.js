/*
 * LaterList
 * @author Will Weiss <william.t.weiss@gmail.com>
 */

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require("sinon"),
  sinonChai = require("sinon-chai"),
  Flood = require('../index').Flood;

var should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

if (!global.Promise)
  global.Promise = require('bluebird').Promise;

describe('Flood', function() {
  it('should be way cool', function() {
    var flood = new Flood();
    flood.push(1,2,3);
    flood.length.should.equal(3);
    var value = flood.value();
    flood.end();
    value.should.eventually.deep.equal([1,2,3]);
  });
  it('should have a concat method', function() {
    var flood = Flood.from([1,2,3]);
    var concatenated = flood.concat([4,5], 6, Flood.from([7,8,9]));
    concatenated.should.be.an.instanceof(Flood);
    return concatenated.value().then(function(arr) {
      arr.sort();
      return arr.should.deep.equal([1,2,3,4,5,6,7,8,9]);
    });
  });

});
