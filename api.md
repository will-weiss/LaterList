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

