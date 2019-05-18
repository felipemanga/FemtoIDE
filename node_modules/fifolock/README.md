# fifolock

Very simple FIFO task runner (usable as a lock or serial queue), plus a callback-wrapping helper.


## Installation

`npm install fifolock`

## Example


```js
var q = require('fifolock')();

q.acquire(function (release) {
    setTimeout(function () {
        console.log("This task started first.");
        release();
    }, 1e3);
});

attemptSomething(function (e, d) {
    if (e) console.warn("Attempt happened to fail.", e);
    else console.log("Attempt happened to succeed,", d);
});

attemptSeveralSomethings(42, function (e) {
    if (e) console.warn("Got the inevitable error.", e);
    else console.log("Wow, that was improbable…");
});

q.acquire(function (done) {
    console.log("This task was started last.");
    done();
});


// callers of q.TRANSACTION_WRAPPER wait to acquire the queue just like any direct users
function attemptSomething(cb, _nested) { cb = q.TRANSACTION_WRAPPER(cb, function () {
    if (Math.random() > 0.75) process.nextTick(function () {
        cb(new Error("Chaos monkey struck!"));
    }); else setTimeout(function () {
        cb(null, "here's the data.");
    }, 0);
    
}, _nested); }

// advanced trick: sharing a single acquisition with nested/nestable helper routines
function attemptSeveralSomethings(n, cb) { cb = q.TRANSACTION_WRAPPER(cb, function () {
    function recursiveAttempt(i) {
        if (i < n) attemptSomething(function (e) {
            if (e) cb(new Error("Only succeeded at "+i+" of "+n+" attempts"));
            else recursiveAttempt(i+1);
        }, true);       // note how, unlike normal callers, we use our internal _nested parameter
        else cb(null);
    }
    recursiveAttempt(0);
}); }
```

This code will output something like:

> This task started first.
> Attempt happened to succeed, here's the data.
> Got the inevitable error. [Error: Only succeeded at 8 of 42 attempts]
> This task was started last.


## API

* `var q = fifolock();` — the module exports a factory function, call it to get a queue instance
* `q.acquire(task)` — enqueues `task` to start when all previously-queued tasks have finished (or in the next tick if `q` was empty). When it is started, `task` will receive one argument e.g. `(finish)` which is a function it *must* call to release the lock and allow any next task to proceed.
* `cb = q.TRANSACTION_WRAPPER(cb, fn, [skipAcquisition])` — this method helps you ensure "normal" async logic happens in a consistent fashion. Before executing `fn` it waits to aquire a lock, but immediately returns a wrapper around `cb` which will forward the call while making sure the lock is properly released. The `skipAcquisition` argument is optional, intended to keep code that must work both within its own transactions, *and* under the auspices of another caller's already-acquired lock. (See example above.)
* `var CUSTOM_WRAPPER = q.TRANSACTION_WRAPPER.bind({postAcquire:preFn, preRelease:postFn});` — the wrapper method also allows you to provide `postAcquire` and/or `preRelease` hooks to bracket a transaction with additional custom logic. The postAcquire hook `preFn(proceed)` should do any addition setup require and then must call `proceed`. Note that while the hook *must* proceed it could signal an error condition by passing custom arguments to `proceed`; these will be forwarded to the main function(s) which would then need to participate in any such failure-handling protocol. The preRelease hook `postFn(finish, [args, ctx])` should do any cleanup necessary and then *must* release the queue by calling `finish`. Note that the preRelease hook gets an array copy of the arguments which will be passed to the wrapped callback in case it affects cleanup, but cannot control what the callback receives. (See "examples/custom_wrapper.js" for a sample custom wrapper.)


## License

© 2014 Nathan Vander Wilt.
Funding for this work was provided in part by Technical Machine, Inc.

Reuse under your choice of:

* [BSD-2-Clause](http://opensource.org/licenses/BSD-2-Clause)
* [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
