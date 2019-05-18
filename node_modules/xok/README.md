# xok


The name is short for extend-object-ownkeys; hat tip to @henrikjoreteg for ['extend-object'](https://www.npmjs.org/package/extend-object) which does pretty much the same thing as this, but uses `for … in` to match Underscore.js instead of `Object.keys` to match ???. See also ['extend'](https://www.npmjs.org/package/extend) if you want all the $.extend features.


## Example

```js
var extend = require('xok'),
    assert = function (ok) { if (!ok) throw Error(); };

// use for shallow copies
var sampleObj = {abc:123,def:42},
    shallowClone = extend({}, sampleObj);
assert('abc' in shallowClone);
shallowClone.def = 0;
assert(sampleObj.def === 42);

// or defaulting options!
function test(opts) {
    opts = extend({
        foo: true,
        bar: 'someDefault'
    }, opts);
    
    return (opts.foo) ? opts.bar : null;
}
assert(test() === 'someDefault');
assert(test({bar:'customValue'}) === 'customValue');
assert(test({foo:false}) === null);
```


## API

* `extend = require('xok')` — this module exports a single function.
* `extend(target, …)` — returns `target` after going through all the following arguments and shallow-copying the objects' own properties into it. The extra arguments may be `null` (anything `false`y really) but are otherwise expected to be objects and not strings or cheeses or wild animals or whatever.


## License

Solipsistic Public License; see LICENSE file for details.