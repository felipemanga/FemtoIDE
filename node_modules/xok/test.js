var extend = require("./"),
    assert = function (ok) { if (!ok) throw Error(); };

var obj = {};
assert(extend(obj) === obj);
assert(extend(obj, {}) === obj);
assert(extend(obj, null) === obj);
assert(extend(obj, null, {property:true}) === obj);
assert(obj.property === true);

var sampleObj = {abc:123,def:42},
    shallowClone = extend({}, sampleObj);
sampleObj.abc = 321;
assert(shallowClone.abc === 123);
shallowClone.def = 0;
assert(sampleObj.def === 42);

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

console.log("It works.");