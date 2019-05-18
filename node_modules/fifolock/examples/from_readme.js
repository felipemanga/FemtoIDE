var q = require("../")();

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
