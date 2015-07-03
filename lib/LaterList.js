var Listener = require('./Listener'),
  State = require('./State'),
  Node = require('./Node');

function LaterList() {
  this._headRef = this._tail = new Node;
  this._state = new State;
};

LaterList.from = function(from) {
  if (from instanceof LaterList)
    return from;
  var laterList = new LaterList;
  from.forEach(laterList.push.bind(laterList));
  laterList.end();
  return laterList;
};

LaterList.prototype.value = function() {
  var arr = [], value = this.consume(arr.push.bind(arr), arr);
  this.value = function() { return value; };
  return value;
};

LaterList.prototype.revive = function(fn, arg) {
  var pending, check = this._state;
  while (pending = check.pending) {
    check.pending = null;
    pending[fn](arg);
    check = pending;
  }
};

LaterList.prototype.push = function(value) {
  this._tail = this._tail.next = new Node(value);
  this.revive('shift');
};

LaterList.prototype.listen = function(onData, onEnd, initialValue) {
  return new Listener(this, onData, onEnd, initialValue);
};

LaterList.prototype.end = function(err) {
  this.push = this.end = thrower('May not be called on an ended laterList.');
  this._state.ended = true;
  this._state.error = err;
  err ? this.revive('end', err) : this.revive('close');
};

LaterList.prototype.close = function() {
  this.listen = this.close = thrower('May not be called on a closed laterList.');
  this._headRef = null;
};

LaterList.prototype.link = function(withPush) {
  var laterList = new LaterList;
  return this.listen(withPush(laterList.push.bind(laterList)), laterList.end.bind(laterList), laterList).value;
};

LaterList.prototype.consume = function(onData, initialValue) {
  return new Promise((function(resolve, reject) {
    this.listen(onData, function(err) {
      return err ? reject(err) : resolve(this.value);
    }, initialValue);
  }).bind(this));
};

LaterList.prototype.map = function(lambda) {
  return this.link(function(push) {
    return function(value) {
      return push(lambda(value));
    };
  });
};

LaterList.prototype.filter = function(predicate) {
  return this.link(nestPredicate(predicate));
};

LaterList.prototype.find = function(predicate) {
  return this.consume(nestPredicate(predicate)(function(value) {
    this.value = value;
    this.end();
  }));
};

LaterList.prototype.reduce = function(lambda, accumulator) {
  return this.consume(function(value) {
    this.value = Promise.resolve(this.value).then(function(accumulator) {
      return lambda(accumulator, value);
    });
  }, accumulator);
};

LaterList.prototype.flatten = function() {
  return this.link(function(push) {
    return function(obj) {
      return LaterList.from(obj).consume(push);
    };
  });
};

LaterList.prototype.concat = function(obj) {
  return LaterList.from([this, obj]).flatten();
};

LaterList.prototype.concat = function(obj) {
  return LaterList.from([this, obj]).flatten();
};

function thrower(msg) {
  return function() { throw new Error(msg); };
};

function nestPredicate(predicate) {
  return function(whenTrueLambda) {
    return function(value) {
      return Promise.resolve(predicate(value)).then((function(res) {
        if (res)
          whenTrueLambda.call(this, value);
      }).bind(this));
    };
  };
};

module.exports = LaterList;
