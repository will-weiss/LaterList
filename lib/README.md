# LaterList [![Build Status](https://travis-ci.org/will-weiss/LaterList.svg?branch=master)](https://travis-ci.org/will-weiss/LaterList)

Handle asynchronous events as an array that will arrive eventually: a LaterList.

# Install

Available via [npm](https://www.npmjs.org/)

```bash
npm install LaterList
```

# Usage
```javascript
var Flood = require('LaterList').Flood

// Works like an array
Flood.of(1,2,3,4,5)
  .map(function(n) {
    return n + 2;
  }).filter(function(n) {
    return n % 2 === 0;
  }).reduce(function(total, n) {
    return total + n;
  }, 0).then(console.log) // 10

// even when callbacks resolve asynchronously
Flood.from(someUserIds)
  .map(db.getUserByIdAsync)
  .reduce(function(pageViews, user) {
    return pageViews + user.pageViews;
  }, 0).then(console.log) // Sum total of page views of those users.
```

# Source

[https://github.com/will-weiss/LaterList](https://github.com/will-weiss/LaterList)

# License

Released under the MIT License.

#

<a name="LaterList"></a>
## LaterList
A LaterList is a linked list which may be used to process values that arrive or
are processed asynchronously. As in many implementations of streams, listeners
may be added to instances of LaterList to process incoming values. There are
however some differences that make LaterList useful.

<ul>

  <li>  Familiar API: Array methods are implemented with an identical syntax.
        Methods that return or mutate arrays return LaterLists. Other methods
        wrap their return values in a Promise.
  </li>
  <li>  Preservation: Listeners will process a whole list even if they are
        added after values have been pushed onto the list. Data is never
        dropped.
  </li>
  </li>
  <li>  Indexing: Values are indexed by the order in which they are pushed.
  </li>
  <li>   Fully Asynchronous: A LaterList may be mapped, reduced, filtered,
         etc. using functions that return Promises. LaterLists process the
         resolved values of Promises pushed onto them.
  </li>
  <li>   Easy Chaining: Methods of LaterLists may be chained together. Values
         are passed along the chain even before the original list has ended
         and uncaught exceptions propogate down the chain.
  </li>
  <li>   Flexible: The two types of LaterLists - Flood and Relay - share an
         identical API but differ slightly in when their elements are
         processed. Elements of a Flood are processed as soon as they are
         available. Elements of a Relay are processed when processing of all
         prior elements is done. So, Floods have higher throughput while
         Relays preserve order, making each suitable for different contexts.
  </li>
  <li>   Unbounded: LaterLists may be pushed onto indefinitely without memory
         overload. When a LaterList is closed, adding new listeners is
         disabled so that elements processed by existing listeners may be
         garbage collected.
  </li>
  <li>   Active Listeners: Listeners of a LaterList are not simply callbacks;
         they are their own class and maintain state. As listeners keep a
         reference to their unprocessed elements, values may be pushed onto a
         LaterList more quickly than they are processed without needing to
         worry about backpressure for all but the most memory-intensive
         applications.
  </li>
  <li>   Lightweight: LaterList has a minimal codebase and no dependencies
         relying only on a JS environment that supports the Promise/A+
         specification.
  </li>
</ul>
