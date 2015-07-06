<a name="LaterList"></a>
## LaterList
A LaterList is a linked list which may be used to process values that arrive
asynchronously. As in many implementations of streams, listeners may be
added to instances of LaterList to process incoming values. There are
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

**Kind**: global interface  

* [LaterList](#LaterList)
  * _instance_
    * [.length](#LaterList+length) : <code>Number</code>
    * [.push(...values)](#LaterList+push) ⇒ <code>Number</code>
    * [.revive(fn, err)](#LaterList+revive)
    * [.end(err)](#LaterList+end)
    * [.link(onData)](#LaterList+link) ⇒ <code>[LaterList](#LaterList)</code>
    * [.close()](#LaterList+close)
    * [.consume(onData, initialValue)](#LaterList+consume) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.value()](#LaterList+value) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
    * [.atIndex(index)](#LaterList+atIndex) ⇒ <code>\*</code>
  * _static_
    * [.from(from)](#LaterList.from) ⇒ <code>[LaterList](#LaterList)</code>
    * [.of(...values)](#LaterList.of) ⇒ <code>[LaterList](#LaterList)</code>

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
### laterList.link(onData) ⇒ <code>[LaterList](#LaterList)</code>
Return a new LaterList instance whose nodes are the result of applying the
supplied onData function to each node of this list.

**Kind**: instance method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - A LaterList of the same subclass as this list.  

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

<a name="LaterList.from"></a>
### LaterList.from(from) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new LaterList instance from an list-like object with a forEach
method. The new list ends when the execution of forEach resolves.

**Kind**: static method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - An instance of LaterList whose nodes have values equal to
                    those of the supplied list-like.  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>Object.&lt;{forEach: function()}&gt;</code> | An object to create a list from. |

<a name="LaterList.of"></a>
### LaterList.of(...values) ⇒ <code>[LaterList](#LaterList)</code>
Creates a new LaterList instance with a variable number of arguments.

**Kind**: static method of <code>[LaterList](#LaterList)</code>  
**Returns**: <code>[LaterList](#LaterList)</code> - An instance of LaterList whose nodes have values equal to
                    those of the supplied arguments.  

| Param | Type | Description |
| --- | --- | --- |
| ...values | <code>\*</code> | The values to add to a new list. |

