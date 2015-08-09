# LaterList [![Build Status](https://travis-ci.org/will-weiss/LaterList.svg?branch=master)](https://travis-ci.org/will-weiss/LaterList)

Handle asynchronous events as an array that will arrive eventually: a LaterList.

# Install

Available via [npm](https://www.npmjs.org/)

```bash
npm install laterlist
```

# Usage
```javascript
var Flood = require('LaterList').Flood;

// Works like an array
Flood.of(1,2,3,4,5)
  .map(function(n) {
    return n + 2;
  }).filter(function(n) {
    return n % 2 === 0;
  }).reduce(function(total, n) {
    return total + n;
  }, 0).then(console.log); // 10

// even when callbacks resolve asynchronously
Flood.from(someUserIds)
  .map(db.getUserByIdAsync)
  .reduce(function(pageViews, user) {
    return pageViews + user.pageViews;
  }, 0).then(console.log); // Sum total of page views of those users.
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

## Classes
<dl>
<dt><a href="#LaterList/Flood">LaterList/Flood</a> ⇐ <code><a href="#LaterList">LaterList</a></code></dt>
<dd><p>A Flood is a LaterList for which values are processed immediately.</p>
</dd>
<dt><a href="#LaterList/Relay">LaterList/Relay</a> ⇐ <code><a href="#LaterList">LaterList</a></code></dt>
<dd><p>A Relay is a LaterList for which order is preserved when listened
to.</p>
</dd>
<dt><a href="#LaterList">LaterList</a></dt>
<dd><p>A LaterList is a linked list which may be used to process values
that arrive or are processed asynchronously.</p>
</dd>
</dl>
<a name="LaterList/Flood"></a>
## LaterList/Flood ⇐ <code>[LaterList](#LaterList)</code>
A Flood is a LaterList for which values are processed immediately.

**Kind**: global class  
**Extends:** <code>[LaterList](#LaterList)</code>  

* [LaterList/Flood](#LaterList/Flood) ⇐ <code>[LaterList](#LaterList)</code>
  * [.length](#LaterList+length) : <code>Number</code>
  * [.addListener(onData, onEnd, initialValue)](#LaterList/Flood+addListener)
  * [.push(...values)](#LaterList+push) ⇒ <code>Number</code>
  * [.revive(fn, err)](#LaterList+revive)
  * [.end(err)](#LaterList+end)
  * [.link(onData)](#LaterList+link) ⇒
  * [.close()](#LaterList+close)
  * [.consume(onData, initialValue)](#LaterList+consume) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.value()](#LaterList+value) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
  * [.atIndex(index)](#LaterList+atIndex) ⇒ <code>\*</code>
  * [.when()](#LaterList+when) ⇒ <code>Promise</code>
  * [.concat(...lists)](#LaterList+concat) ⇒ <code>[LaterList](#LaterList)</code>
  * [.every(predicate, thisArg)](#LaterList+every) ⇒ <code>Promise.&lt;Boolean&gt;</code>
  * [.filter(predicate, thisArg)](#LaterList+filter) ⇒ <code>[LaterList](#LaterList)</code>
  * [.find(predicate, thisArg)](#LaterList+find) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.findIndex(predicate, thisArg)](#LaterList+findIndex) ⇒ <code>Promise.&lt;Number&gt;</code>
  * [.forEach(lambda, thisArg)](#LaterList+forEach) ⇒ <code>Promise.&lt;undefined&gt;</code>
  * [.includes(toMatch, fromIndex)](#LaterList+includes) ⇒ <code>Promise.&lt;Boolean&gt;</code>
  * [.indexOf(toMatch)](#LaterList+indexOf) ⇒ <code>Promise.&lt;Number&gt;</code>
  * [.join(separator)](#LaterList+join) ⇒ <code>Promise.&lt;String&gt;</code>
  * [.lastIndexOf(toMatch)](#LaterList+lastIndexOf) ⇒ <code>Promise.&lt;Number&gt;</code>
  * [.map(lambda, thisArg)](#LaterList+map) ⇒ <code>[LaterList](#LaterList)</code>
  * [.reduce(lambda, initialValue)](#LaterList+reduce) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.reduceRight(lambda, initialValue)](#LaterList+reduceRight) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.reverse()](#LaterList+reverse) ⇒ <code>[LaterList](#LaterList)</code>
  * [.slice(begin, end)](#LaterList+slice) ⇒ <code>[LaterList](#LaterList)</code>
  * [.some(predicate, thisArg)](#LaterList+some) ⇒ <code>Promise.&lt;Boolean&gt;</code>
  * [.sort(compare)](#LaterList+sort) ⇒ <code>[LaterList](#LaterList)</code>
  * [.splice(begin, deleteCount, ...additions)](#LaterList+splice) ⇒ <code>[LaterList](#LaterList)</code>

<a name="LaterList+length"></a>
### laterList/Flood.length : <code>Number</code>
Number of nodes in the list.

**Kind**: instance property of <code>[LaterList/Flood](#LaterList/Flood)</code>  
<a name="LaterList/Flood+addListener"></a>
### laterList/Flood.addListener(onData, onEnd, initialValue)
Adds a listener which processes values of this flood as soon as they
arrive.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function applied to each node. |
| onEnd | <code>function</code> | A function to execute on end. |
| initialValue | <code>\*</code> | An initial value. |

<a name="LaterList+push"></a>
### laterList/Flood.push(...values) ⇒ <code>Number</code>
Adds a values to the list's tail. Pending listeners are revived and shifted.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Number</code> - The new length of the list.  

| Param | Type | Description |
| --- | --- | --- |
| ...values | <code>\*</code> | The values to add to the end of the list. |

<a name="LaterList+revive"></a>
### laterList/Flood.revive(fn, err)
Executes a Listener.prototype function on each pending listener.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | A Listener.prototype function. |
| err | <code>Error</code> | Optional. An error to pass to pending listeners. |

<a name="LaterList+end"></a>
### laterList/Flood.end(err)
Indicates that no more nodes will be added to the list. If an argument is
present it is interpreted as an error which will immediately end all
listeners. If no argument is present, listeners will end when they have
processed all nodes of the list. Subsequent calls of push and end on this
list will throw.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>error</code> | An optional error. |

<a name="LaterList+link"></a>
### laterList/Flood.link(onData) ⇒
Return a new LaterList instance whose nodes are the result of applying the
supplied onData function to each node of this list.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: LaterList A LaterList of the same subclass as this list.  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function to process nodes of this list                                     executed in the context of the listener. |

<a name="LaterList+close"></a>
### laterList/Flood.close()
Indicates that no more listeners will be added to this list. The reference to
the head of the list is removed so that nodes processed by each listener may
be garbage colllected. Subsequent calls of [close](#LaterList+close),
[atIndex](#LaterList+atIndex) and adding of listeners on this list will throw as
these methods require a reference to the list's head.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
<a name="LaterList+consume"></a>
### laterList/Flood.consume(onData, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns a promise that resolves with the final value of a listener.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The result of the computation of the listener.  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function to process nodes of this list                                    executed in the context of the listener. |
| initialValue | <code>\*</code> | An initial value set on the listener. |

<a name="LaterList+value"></a>
### laterList/Flood.value() ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
Collect the nodes of the list as an array.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> - Resolves with the values of the list's nodes.  
<a name="LaterList+atIndex"></a>
### laterList/Flood.atIndex(index) ⇒ <code>\*</code>
Looks up the value of the node at the supplied index. Returns undefined if
the index is not a number or out of bounds.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>\*</code> - The value of the node at that index.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | An index of the list. |

<a name="LaterList+when"></a>
### laterList/Flood.when() ⇒ <code>Promise</code>
Resolves with undefined if the list ends without error, rejects if the list
ends with an error.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
<a name="LaterList+concat"></a>
### laterList/Flood.concat(...lists) ⇒ <code>[LaterList](#LaterList)</code>
Returns a new list comprised of the list on which it is called joined with
the list-like(s) and/or value(s) provided as arguments.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list whose nodes have the concatenated values of the
                    supplied arguments.  

| Param | Type | Description |
| --- | --- | --- |
| ...lists | <code>Object.&lt;{forEach: function()}&gt;</code> | list-likes to concatenate                                                 to this list. |

<a name="LaterList+every"></a>
### laterList/Flood.every(predicate, thisArg) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Tests whether all nodes in the list pass the test implemented by the
provided function.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - true if the predicate is true for all nodes in
                           the list, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+filter"></a>
### laterList/Flood.filter(predicate, thisArg) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new LaterList with all nodes that pass the test implemented by
the provided function.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list with the filtered values of the original list.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+find"></a>
### laterList/Flood.find(predicate, thisArg) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns a value in the list, if a node in the list satisfies the provided
testing function. Otherwise undefined is returned.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The value of the first node to satisfy the predicate.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+findIndex"></a>
### laterList/Flood.findIndex(predicate, thisArg) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns an index in the list, if a node in the list satisfies the provided
testing function. Otherwise -1 is returned.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The first index of a node satisfying the
                          predicate.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+forEach"></a>
### laterList/Flood.forEach(lambda, thisArg) ⇒ <code>Promise.&lt;undefined&gt;</code>
Executes a provided function once per node.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;undefined&gt;</code> - Resolves when processing has ended.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the lambda. |

<a name="LaterList+includes"></a>
### laterList/Flood.includes(toMatch, fromIndex) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Determines whether a list includes a certain element, returning true or
false as appropriate.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - Whether the value appears in the list.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |
| fromIndex | <code>Number</code> | Optional. The position in this list at which to                             begin searching for searchElement; defaults to                             0. |

<a name="LaterList+indexOf"></a>
### laterList/Flood.indexOf(toMatch) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns the first index at which a given value can be found in the list, or
-1 if it is not present.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The first index of a node with the supplied value.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |

<a name="LaterList+join"></a>
### laterList/Flood.join(separator) ⇒ <code>Promise.&lt;String&gt;</code>
Joins all values of a list into a string.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  

| Param | Type | Description |
| --- | --- | --- |
| separator | <code>String</code> | Specifies a string to separate each value of                             the list. |

<a name="LaterList+lastIndexOf"></a>
### laterList/Flood.lastIndexOf(toMatch) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns the last index at which a given value can be found in the list, or
-1 if it is not present.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The last index of a node with the supplied value.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |

<a name="LaterList+map"></a>
### laterList/Flood.map(lambda, thisArg) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new list with the results of calling a provided function on every
node in this list.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the results of mapping the lambda over
                    this list.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the lambda. |

<a name="LaterList+reduce"></a>
### laterList/Flood.reduce(lambda, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Applies a function against an accumulator and each node of the list (from
left-to-right) has to reduce it to a single value.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The reduced value.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| initialValue | <code>\*</code> | Optional. Object to use as the                                           first argument to the first call                                           of the lambda. |

<a name="LaterList+reduceRight"></a>
### laterList/Flood.reduceRight(lambda, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Applies a function against an accumulator and each node of the list (from
right-to-left) has to reduce it to a single value. Note that this operation
can only commence when the list has ended and been reversed. As this is
computationally expensive, finding other approaches is recommended.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The reduced value.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| initialValue | <code>\*</code> | Optional. Object to use as the                                           first argument to the first call                                           of the lambda. |

<a name="LaterList+reverse"></a>
### laterList/Flood.reverse() ⇒ <code>[LaterList](#LaterList)</code>
Returns a reversed list. The first list node becomes the last and the last
becomes the first. Note that while this operation maintains a copy of each
node and can only complete when the list has ended. As this is
computationally expensive, finding other approaches is recommended.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the values of this list reversed.  
<a name="LaterList+slice"></a>
### laterList/Flood.slice(begin, end) ⇒ <code>[LaterList](#LaterList)</code>
Returns a shallow copy of a portion of a list into a new list.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list with the sliced portion of this list.  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>Number</code> | An index to begin at. |
| end | <code>Number</code> | An index to end at. |

<a name="LaterList+some"></a>
### laterList/Flood.some(predicate, thisArg) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Tests whether some element in the list passes the test implemented by the
provided function.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - true if the predicate is true for some node in
                           the list, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when executing                           predicate. |

<a name="LaterList+sort"></a>
### laterList/Flood.sort(compare) ⇒ <code>[LaterList](#LaterList)</code>
Returns a LaterList with the sorted nodes of this list. Note that this
operation can only commence when the list has ended and requires all the
values of the list collected in an array before they are sorted and copied
to the resulting list. As this is computationally expensive, finding other
approaches is recommended.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with sorted values from this list.  

| Param | Type | Description |
| --- | --- | --- |
| compare | <code>function</code> | Optional. A function on which to sort. |

<a name="LaterList+splice"></a>
### laterList/Flood.splice(begin, deleteCount, ...additions) ⇒ <code>[LaterList](#LaterList)</code>
Returns a new list with some nodes in this list removed and/or some nodes
added.

**Kind**: instance method of <code>[LaterList/Flood](#LaterList/Flood)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the modified values from this list.  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>Number</code> | An index to begin at. |
| deleteCount | <code>Number</code> | The number of elements to remove. |
| ...additions | <code>\*</code> | Values to add to the list. |

<a name="LaterList/Relay"></a>
## LaterList/Relay ⇐ <code>[LaterList](#LaterList)</code>
A Relay is a LaterList for which order is preserved when listened
to.

**Kind**: global class  
**Extends:** <code>[LaterList](#LaterList)</code>  

* [LaterList/Relay](#LaterList/Relay) ⇐ <code>[LaterList](#LaterList)</code>
  * [.length](#LaterList+length) : <code>Number</code>
  * [.addListener(onData, onEnd, initialValue)](#LaterList/Relay+addListener)
  * [.push(...values)](#LaterList+push) ⇒ <code>Number</code>
  * [.revive(fn, err)](#LaterList+revive)
  * [.end(err)](#LaterList+end)
  * [.link(onData)](#LaterList+link) ⇒
  * [.close()](#LaterList+close)
  * [.consume(onData, initialValue)](#LaterList+consume) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.value()](#LaterList+value) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
  * [.atIndex(index)](#LaterList+atIndex) ⇒ <code>\*</code>
  * [.when()](#LaterList+when) ⇒ <code>Promise</code>
  * [.concat(...lists)](#LaterList+concat) ⇒ <code>[LaterList](#LaterList)</code>
  * [.every(predicate, thisArg)](#LaterList+every) ⇒ <code>Promise.&lt;Boolean&gt;</code>
  * [.filter(predicate, thisArg)](#LaterList+filter) ⇒ <code>[LaterList](#LaterList)</code>
  * [.find(predicate, thisArg)](#LaterList+find) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.findIndex(predicate, thisArg)](#LaterList+findIndex) ⇒ <code>Promise.&lt;Number&gt;</code>
  * [.forEach(lambda, thisArg)](#LaterList+forEach) ⇒ <code>Promise.&lt;undefined&gt;</code>
  * [.includes(toMatch, fromIndex)](#LaterList+includes) ⇒ <code>Promise.&lt;Boolean&gt;</code>
  * [.indexOf(toMatch)](#LaterList+indexOf) ⇒ <code>Promise.&lt;Number&gt;</code>
  * [.join(separator)](#LaterList+join) ⇒ <code>Promise.&lt;String&gt;</code>
  * [.lastIndexOf(toMatch)](#LaterList+lastIndexOf) ⇒ <code>Promise.&lt;Number&gt;</code>
  * [.map(lambda, thisArg)](#LaterList+map) ⇒ <code>[LaterList](#LaterList)</code>
  * [.reduce(lambda, initialValue)](#LaterList+reduce) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.reduceRight(lambda, initialValue)](#LaterList+reduceRight) ⇒ <code>Promise.&lt;\*&gt;</code>
  * [.reverse()](#LaterList+reverse) ⇒ <code>[LaterList](#LaterList)</code>
  * [.slice(begin, end)](#LaterList+slice) ⇒ <code>[LaterList](#LaterList)</code>
  * [.some(predicate, thisArg)](#LaterList+some) ⇒ <code>Promise.&lt;Boolean&gt;</code>
  * [.sort(compare)](#LaterList+sort) ⇒ <code>[LaterList](#LaterList)</code>
  * [.splice(begin, deleteCount, ...additions)](#LaterList+splice) ⇒ <code>[LaterList](#LaterList)</code>

<a name="LaterList+length"></a>
### laterList/Relay.length : <code>Number</code>
Number of nodes in the list.

**Kind**: instance property of <code>[LaterList/Relay](#LaterList/Relay)</code>  
<a name="LaterList/Relay+addListener"></a>
### laterList/Relay.addListener(onData, onEnd, initialValue)
Adds a listener which processes values of this relay when all prior values
have been processed.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function applied to each node. |
| onEnd | <code>function</code> | A function to execute on end. |
| initialValue | <code>\*</code> | An initial value. |

<a name="LaterList+push"></a>
### laterList/Relay.push(...values) ⇒ <code>Number</code>
Adds a values to the list's tail. Pending listeners are revived and shifted.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Number</code> - The new length of the list.  

| Param | Type | Description |
| --- | --- | --- |
| ...values | <code>\*</code> | The values to add to the end of the list. |

<a name="LaterList+revive"></a>
### laterList/Relay.revive(fn, err)
Executes a Listener.prototype function on each pending listener.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | A Listener.prototype function. |
| err | <code>Error</code> | Optional. An error to pass to pending listeners. |

<a name="LaterList+end"></a>
### laterList/Relay.end(err)
Indicates that no more nodes will be added to the list. If an argument is
present it is interpreted as an error which will immediately end all
listeners. If no argument is present, listeners will end when they have
processed all nodes of the list. Subsequent calls of push and end on this
list will throw.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>error</code> | An optional error. |

<a name="LaterList+link"></a>
### laterList/Relay.link(onData) ⇒
Return a new LaterList instance whose nodes are the result of applying the
supplied onData function to each node of this list.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: LaterList A LaterList of the same subclass as this list.  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function to process nodes of this list                                     executed in the context of the listener. |

<a name="LaterList+close"></a>
### laterList/Relay.close()
Indicates that no more listeners will be added to this list. The reference to
the head of the list is removed so that nodes processed by each listener may
be garbage colllected. Subsequent calls of [close](#LaterList+close),
[atIndex](#LaterList+atIndex) and adding of listeners on this list will throw as
these methods require a reference to the list's head.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
<a name="LaterList+consume"></a>
### laterList/Relay.consume(onData, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns a promise that resolves with the final value of a listener.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The result of the computation of the listener.  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function to process nodes of this list                                    executed in the context of the listener. |
| initialValue | <code>\*</code> | An initial value set on the listener. |

<a name="LaterList+value"></a>
### laterList/Relay.value() ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
Collect the nodes of the list as an array.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> - Resolves with the values of the list's nodes.  
<a name="LaterList+atIndex"></a>
### laterList/Relay.atIndex(index) ⇒ <code>\*</code>
Looks up the value of the node at the supplied index. Returns undefined if
the index is not a number or out of bounds.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>\*</code> - The value of the node at that index.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | An index of the list. |

<a name="LaterList+when"></a>
### laterList/Relay.when() ⇒ <code>Promise</code>
Resolves with undefined if the list ends without error, rejects if the list
ends with an error.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
<a name="LaterList+concat"></a>
### laterList/Relay.concat(...lists) ⇒ <code>[LaterList](#LaterList)</code>
Returns a new list comprised of the list on which it is called joined with
the list-like(s) and/or value(s) provided as arguments.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list whose nodes have the concatenated values of the
                    supplied arguments.  

| Param | Type | Description |
| --- | --- | --- |
| ...lists | <code>Object.&lt;{forEach: function()}&gt;</code> | list-likes to concatenate                                                 to this list. |

<a name="LaterList+every"></a>
### laterList/Relay.every(predicate, thisArg) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Tests whether all nodes in the list pass the test implemented by the
provided function.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - true if the predicate is true for all nodes in
                           the list, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+filter"></a>
### laterList/Relay.filter(predicate, thisArg) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new LaterList with all nodes that pass the test implemented by
the provided function.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list with the filtered values of the original list.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+find"></a>
### laterList/Relay.find(predicate, thisArg) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns a value in the list, if a node in the list satisfies the provided
testing function. Otherwise undefined is returned.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The value of the first node to satisfy the predicate.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+findIndex"></a>
### laterList/Relay.findIndex(predicate, thisArg) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns an index in the list, if a node in the list satisfies the provided
testing function. Otherwise -1 is returned.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The first index of a node satisfying the
                          predicate.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+forEach"></a>
### laterList/Relay.forEach(lambda, thisArg) ⇒ <code>Promise.&lt;undefined&gt;</code>
Executes a provided function once per node.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;undefined&gt;</code> - Resolves when processing has ended.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the lambda. |

<a name="LaterList+includes"></a>
### laterList/Relay.includes(toMatch, fromIndex) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Determines whether a list includes a certain element, returning true or
false as appropriate.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - Whether the value appears in the list.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |
| fromIndex | <code>Number</code> | Optional. The position in this list at which to                             begin searching for searchElement; defaults to                             0. |

<a name="LaterList+indexOf"></a>
### laterList/Relay.indexOf(toMatch) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns the first index at which a given value can be found in the list, or
-1 if it is not present.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The first index of a node with the supplied value.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |

<a name="LaterList+join"></a>
### laterList/Relay.join(separator) ⇒ <code>Promise.&lt;String&gt;</code>
Joins all values of a list into a string.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  

| Param | Type | Description |
| --- | --- | --- |
| separator | <code>String</code> | Specifies a string to separate each value of                             the list. |

<a name="LaterList+lastIndexOf"></a>
### laterList/Relay.lastIndexOf(toMatch) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns the last index at which a given value can be found in the list, or
-1 if it is not present.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The last index of a node with the supplied value.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |

<a name="LaterList+map"></a>
### laterList/Relay.map(lambda, thisArg) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new list with the results of calling a provided function on every
node in this list.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the results of mapping the lambda over
                    this list.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the lambda. |

<a name="LaterList+reduce"></a>
### laterList/Relay.reduce(lambda, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Applies a function against an accumulator and each node of the list (from
left-to-right) has to reduce it to a single value.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The reduced value.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| initialValue | <code>\*</code> | Optional. Object to use as the                                           first argument to the first call                                           of the lambda. |

<a name="LaterList+reduceRight"></a>
### laterList/Relay.reduceRight(lambda, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Applies a function against an accumulator and each node of the list (from
right-to-left) has to reduce it to a single value. Note that this operation
can only commence when the list has ended and been reversed. As this is
computationally expensive, finding other approaches is recommended.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The reduced value.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| initialValue | <code>\*</code> | Optional. Object to use as the                                           first argument to the first call                                           of the lambda. |

<a name="LaterList+reverse"></a>
### laterList/Relay.reverse() ⇒ <code>[LaterList](#LaterList)</code>
Returns a reversed list. The first list node becomes the last and the last
becomes the first. Note that while this operation maintains a copy of each
node and can only complete when the list has ended. As this is
computationally expensive, finding other approaches is recommended.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the values of this list reversed.  
<a name="LaterList+slice"></a>
### laterList/Relay.slice(begin, end) ⇒ <code>[LaterList](#LaterList)</code>
Returns a shallow copy of a portion of a list into a new list.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list with the sliced portion of this list.  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>Number</code> | An index to begin at. |
| end | <code>Number</code> | An index to end at. |

<a name="LaterList+some"></a>
### laterList/Relay.some(predicate, thisArg) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Tests whether some element in the list passes the test implemented by the
provided function.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - true if the predicate is true for some node in
                           the list, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when executing                           predicate. |

<a name="LaterList+sort"></a>
### laterList/Relay.sort(compare) ⇒ <code>[LaterList](#LaterList)</code>
Returns a LaterList with the sorted nodes of this list. Note that this
operation can only commence when the list has ended and requires all the
values of the list collected in an array before they are sorted and copied
to the resulting list. As this is computationally expensive, finding other
approaches is recommended.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with sorted values from this list.  

| Param | Type | Description |
| --- | --- | --- |
| compare | <code>function</code> | Optional. A function on which to sort. |

<a name="LaterList+splice"></a>
### laterList/Relay.splice(begin, deleteCount, ...additions) ⇒ <code>[LaterList](#LaterList)</code>
Returns a new list with some nodes in this list removed and/or some nodes
added.

**Kind**: instance method of <code>[LaterList/Relay](#LaterList/Relay)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the modified values from this list.  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>Number</code> | An index to begin at. |
| deleteCount | <code>Number</code> | The number of elements to remove. |
| ...additions | <code>\*</code> | Values to add to the list. |

<a name="LaterList"></a>
## LaterList
A LaterList is a linked list which may be used to process values
that arrive or are processed asynchronously.

**Kind**: global class  

* [LaterList](#LaterList)
  * _instance_
    * [.length](#LaterList+length) : <code>Number</code>
    * [.push(...values)](#LaterList+push) ⇒ <code>Number</code>
    * [.revive(fn, err)](#LaterList+revive)
    * [.end(err)](#LaterList+end)
    * [.link(onData)](#LaterList+link) ⇒
    * [.close()](#LaterList+close)
    * [.consume(onData, initialValue)](#LaterList+consume) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.value()](#LaterList+value) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
    * [.atIndex(index)](#LaterList+atIndex) ⇒ <code>\*</code>
    * [.when()](#LaterList+when) ⇒ <code>Promise</code>
    * [.concat(...lists)](#LaterList+concat) ⇒ <code>[LaterList](#LaterList)</code>
    * [.every(predicate, thisArg)](#LaterList+every) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.filter(predicate, thisArg)](#LaterList+filter) ⇒ <code>[LaterList](#LaterList)</code>
    * [.find(predicate, thisArg)](#LaterList+find) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.findIndex(predicate, thisArg)](#LaterList+findIndex) ⇒ <code>Promise.&lt;Number&gt;</code>
    * [.forEach(lambda, thisArg)](#LaterList+forEach) ⇒ <code>Promise.&lt;undefined&gt;</code>
    * [.includes(toMatch, fromIndex)](#LaterList+includes) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.indexOf(toMatch)](#LaterList+indexOf) ⇒ <code>Promise.&lt;Number&gt;</code>
    * [.join(separator)](#LaterList+join) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.lastIndexOf(toMatch)](#LaterList+lastIndexOf) ⇒ <code>Promise.&lt;Number&gt;</code>
    * [.map(lambda, thisArg)](#LaterList+map) ⇒ <code>[LaterList](#LaterList)</code>
    * [.reduce(lambda, initialValue)](#LaterList+reduce) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.reduceRight(lambda, initialValue)](#LaterList+reduceRight) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.reverse()](#LaterList+reverse) ⇒ <code>[LaterList](#LaterList)</code>
    * [.slice(begin, end)](#LaterList+slice) ⇒ <code>[LaterList](#LaterList)</code>
    * [.some(predicate, thisArg)](#LaterList+some) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.sort(compare)](#LaterList+sort) ⇒ <code>[LaterList](#LaterList)</code>
    * [.splice(begin, deleteCount, ...additions)](#LaterList+splice) ⇒ <code>[LaterList](#LaterList)</code>
  * _static_
    * [.from(listLike, mapFn, thisArg)](#LaterList.from) ⇒
    * [.of(...values)](#LaterList.of) ⇒

<a name="LaterList+length"></a>
### laterList.length : <code>Number</code>
Number of nodes in the list.

**Kind**: instance property of <code>[LaterList](#LaterList)</code>  
<a name="LaterList+push"></a>
### laterList.push(...values) ⇒ <code>Number</code>
Adds a values to the list's tail. Pending listeners are revived and shifted.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Number</code> - The new length of the list.  

| Param | Type | Description |
| --- | --- | --- |
| ...values | <code>\*</code> | The values to add to the end of the list. |

<a name="LaterList+revive"></a>
### laterList.revive(fn, err)
Executes a Listener.prototype function on each pending listener.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | A Listener.prototype function. |
| err | <code>Error</code> | Optional. An error to pass to pending listeners. |

<a name="LaterList+end"></a>
### laterList.end(err)
Indicates that no more nodes will be added to the list. If an argument is
present it is interpreted as an error which will immediately end all
listeners. If no argument is present, listeners will end when they have
processed all nodes of the list. Subsequent calls of push and end on this
list will throw.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>error</code> | An optional error. |

<a name="LaterList+link"></a>
### laterList.link(onData) ⇒
Return a new LaterList instance whose nodes are the result of applying the
supplied onData function to each node of this list.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: LaterList A LaterList of the same subclass as this list.  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function to process nodes of this list                                     executed in the context of the listener. |

<a name="LaterList+close"></a>
### laterList.close()
Indicates that no more listeners will be added to this list. The reference to
the head of the list is removed so that nodes processed by each listener may
be garbage colllected. Subsequent calls of [close](#LaterList+close),
[atIndex](#LaterList+atIndex) and adding of listeners on this list will throw as
these methods require a reference to the list's head.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
<a name="LaterList+consume"></a>
### laterList.consume(onData, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns a promise that resolves with the final value of a listener.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The result of the computation of the listener.  

| Param | Type | Description |
| --- | --- | --- |
| onData | <code>function</code> | A function to process nodes of this list                                    executed in the context of the listener. |
| initialValue | <code>\*</code> | An initial value set on the listener. |

<a name="LaterList+value"></a>
### laterList.value() ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
Collect the nodes of the list as an array.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> - Resolves with the values of the list's nodes.  
<a name="LaterList+atIndex"></a>
### laterList.atIndex(index) ⇒ <code>\*</code>
Looks up the value of the node at the supplied index. Returns undefined if
the index is not a number or out of bounds.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>\*</code> - The value of the node at that index.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | An index of the list. |

<a name="LaterList+when"></a>
### laterList.when() ⇒ <code>Promise</code>
Resolves with undefined if the list ends without error, rejects if the list
ends with an error.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
<a name="LaterList+concat"></a>
### laterList.concat(...lists) ⇒ <code>[LaterList](#LaterList)</code>
Returns a new list comprised of the list on which it is called joined with
the list-like(s) and/or value(s) provided as arguments.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list whose nodes have the concatenated values of the
                    supplied arguments.  

| Param | Type | Description |
| --- | --- | --- |
| ...lists | <code>Object.&lt;{forEach: function()}&gt;</code> | list-likes to concatenate                                                 to this list. |

<a name="LaterList+every"></a>
### laterList.every(predicate, thisArg) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Tests whether all nodes in the list pass the test implemented by the
provided function.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - true if the predicate is true for all nodes in
                           the list, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+filter"></a>
### laterList.filter(predicate, thisArg) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new LaterList with all nodes that pass the test implemented by
the provided function.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list with the filtered values of the original list.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+find"></a>
### laterList.find(predicate, thisArg) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns a value in the list, if a node in the list satisfies the provided
testing function. Otherwise undefined is returned.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The value of the first node to satisfy the predicate.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+findIndex"></a>
### laterList.findIndex(predicate, thisArg) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns an index in the list, if a node in the list satisfies the provided
testing function. Otherwise -1 is returned.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The first index of a node satisfying the
                          predicate.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the predicate. |

<a name="LaterList+forEach"></a>
### laterList.forEach(lambda, thisArg) ⇒ <code>Promise.&lt;undefined&gt;</code>
Executes a provided function once per node.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;undefined&gt;</code> - Resolves when processing has ended.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the lambda. |

<a name="LaterList+includes"></a>
### laterList.includes(toMatch, fromIndex) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Determines whether a list includes a certain element, returning true or
false as appropriate.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - Whether the value appears in the list.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |
| fromIndex | <code>Number</code> | Optional. The position in this list at which to                             begin searching for searchElement; defaults to                             0. |

<a name="LaterList+indexOf"></a>
### laterList.indexOf(toMatch) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns the first index at which a given value can be found in the list, or
-1 if it is not present.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The first index of a node with the supplied value.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |

<a name="LaterList+join"></a>
### laterList.join(separator) ⇒ <code>Promise.&lt;String&gt;</code>
Joins all values of a list into a string.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  

| Param | Type | Description |
| --- | --- | --- |
| separator | <code>String</code> | Specifies a string to separate each value of                             the list. |

<a name="LaterList+lastIndexOf"></a>
### laterList.lastIndexOf(toMatch) ⇒ <code>Promise.&lt;Number&gt;</code>
Returns the last index at which a given value can be found in the list, or
-1 if it is not present.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Number&gt;</code> - The last index of a node with the supplied value.  

| Param | Type | Description |
| --- | --- | --- |
| toMatch | <code>\*</code> | A value to match. |

<a name="LaterList+map"></a>
### laterList.map(lambda, thisArg) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new list with the results of calling a provided function on every
node in this list.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the results of mapping the lambda over
                    this list.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| thisArg | <code>Object</code> | Optional. Value to use as this when                                      executing the lambda. |

<a name="LaterList+reduce"></a>
### laterList.reduce(lambda, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Applies a function against an accumulator and each node of the list (from
left-to-right) has to reduce it to a single value.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The reduced value.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| initialValue | <code>\*</code> | Optional. Object to use as the                                           first argument to the first call                                           of the lambda. |

<a name="LaterList+reduceRight"></a>
### laterList.reduceRight(lambda, initialValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Applies a function against an accumulator and each node of the list (from
right-to-left) has to reduce it to a single value. Note that this operation
can only commence when the list has ended and been reversed. As this is
computationally expensive, finding other approaches is recommended.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The reduced value.  

| Param | Type | Description |
| --- | --- | --- |
| lambda | <code>function</code> | Function to execute for each element |
| initialValue | <code>\*</code> | Optional. Object to use as the                                           first argument to the first call                                           of the lambda. |

<a name="LaterList+reverse"></a>
### laterList.reverse() ⇒ <code>[LaterList](#LaterList)</code>
Returns a reversed list. The first list node becomes the last and the last
becomes the first. Note that while this operation maintains a copy of each
node and can only complete when the list has ended. As this is
computationally expensive, finding other approaches is recommended.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the values of this list reversed.  
<a name="LaterList+slice"></a>
### laterList.slice(begin, end) ⇒ <code>[LaterList](#LaterList)</code>
Returns a shallow copy of a portion of a list into a new list.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A list with the sliced portion of this list.  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>Number</code> | An index to begin at. |
| end | <code>Number</code> | An index to end at. |

<a name="LaterList+some"></a>
### laterList.some(predicate, thisArg) ⇒ <code>Promise.&lt;Boolean&gt;</code>
Tests whether some element in the list passes the test implemented by the
provided function.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - true if the predicate is true for some node in
                           the list, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>function</code> | Function to test for each element. |
| thisArg | <code>Object</code> | Optional. Value to use as this when executing                           predicate. |

<a name="LaterList+sort"></a>
### laterList.sort(compare) ⇒ <code>[LaterList](#LaterList)</code>
Returns a LaterList with the sorted nodes of this list. Note that this
operation can only commence when the list has ended and requires all the
values of the list collected in an array before they are sorted and copied
to the resulting list. As this is computationally expensive, finding other
approaches is recommended.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with sorted values from this list.  

| Param | Type | Description |
| --- | --- | --- |
| compare | <code>function</code> | Optional. A function on which to sort. |

<a name="LaterList+splice"></a>
### laterList.splice(begin, deleteCount, ...additions) ⇒ <code>[LaterList](#LaterList)</code>
Returns a new list with some nodes in this list removed and/or some nodes
added.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A new list with the modified values from this list.  

| Param | Type | Description |
| --- | --- | --- |
| begin | <code>Number</code> | An index to begin at. |
| deleteCount | <code>Number</code> | The number of elements to remove. |
| ...additions | <code>\*</code> | Values to add to the list. |

<a name="LaterList.from"></a>
### LaterList.from(listLike, mapFn, thisArg) ⇒
Creates a new LaterList instance from an list-like object with a forEach
method. The new list ends when the execution of forEach resolves.

**Kind**: static method of <code>[LaterList](#LaterList)</code>  
**Returns**: LaterList An instance of LaterList whose nodes have values equal to
                    those of the supplied list-like.  

| Param | Type | Description |
| --- | --- | --- |
| listLike | <code>Object.&lt;{forEach: function()}&gt;</code> | An object to create a list                                                 from. |
| mapFn | <code>function</code> | Optional. Map function to call on every element of                            the list. |
| thisArg | <code>Object</code> | Optional. Value to use as this when executing                             mapFn. |

<a name="LaterList.of"></a>
### LaterList.of(...values) ⇒
Creates a new LaterList instance with a variable number of arguments.

**Kind**: static method of <code>[LaterList](#LaterList)</code>  
**Returns**: LaterList An instance of LaterList whose nodes have values equal to
                    those of the supplied arguments.  

| Param | Type | Description |
| --- | --- | --- |
| ...values | <code>\*</code> | The values to add to a new list. |

