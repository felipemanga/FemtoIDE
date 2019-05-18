var Q = require("./"),
    q = Q();

var lastLog = false;
setTimeout(q.acquire.bind(null, function (cb) {
    console.log("If this is last, all tests passed :-)");
    lastLog = true;
    cb();
}), 500);       // NOTE: this is a longer wait than any below…

function sampleLogic(finish) {
    if (sampleLogic.busy) throw Error("Sample logic re-entered!");
    else sampleLogic.busy = true;
    if (lastLog) console.error("FAILURE: final task called too soon!"), process.exit(1);
    else console.log("Waiting a bit…");
    setTimeout(function () {
        sampleLogic.busy = false;
        finish();
    }, 100);
}

q.acquire(sampleLogic);
q.acquire(sampleLogic);
process.nextTick(q.acquire.bind(null, sampleLogic));
process.nextTick(q.acquire.bind(null, sampleLogic));
setTimeout(q.acquire.bind(null, sampleLogic), 0);

function wrappedTest(cb) { cb = q.TRANSACTION_WRAPPER(cb, function () {
    sampleLogic(function () {
        cb.call({custom:true}, "1", "2", "3");
    });
}); }

function validatingCallback(a, b, c) {
    if (!this.custom) throw Error("Incorrect `this` context!");
    else if (a !== "1" || c !== "3") throw Error("Bad arguments!");
}

wrappedTest(validatingCallback);
wrappedTest(validatingCallback);
process.nextTick(wrappedTest.bind(null, validatingCallback));
process.nextTick(wrappedTest.bind(null, validatingCallback));
setTimeout(wrappedTest.bind(null, validatingCallback), 42);

function nestedTest(cb) { cb = q.TRANSACTION_WRAPPER(cb, function () {
    try {
        sampleLogic();
    } catch (e) {
        cb();
    }
}, true); }

var nestCalled = false;
nestedTest(function () {
    nestCalled = true;
});
setTimeout(function () {
    if (!nestCalled) throw Error("Nested callback should have fired by now!");
}, 0);


var inCustomWrapper;
CUSTOM_WRAPPER = q.TRANSACTION_WRAPPER.bind({
    postAcquire: function (proceed) {
        if (inCustomWrapper) throw Error("preRelease wasn't called!");
        else inCustomWrapper = true;
        proceed();
    },
    preRelease: function (finish) {
        if (inCustomWrapper !== 'main') throw Error("Main routine wasn't called!");
        else inCustomWrapper = false;
        finish();
    }
});

function customWrapped(cb) { cb = CUSTOM_WRAPPER(cb, function () {
    if (!inCustomWrapper) throw Error("postAcquire wasn't called!");
    else inCustomWrapper = 'main';
    sampleLogic(function () {
        cb.call({custom:true}, "1", "2", "3");
    });
}); }

customWrapped(validatingCallback);
customWrapped(validatingCallback);
process.nextTick(customWrapped.bind(null, validatingCallback));
process.nextTick(customWrapped.bind(null, validatingCallback));
setTimeout(customWrapped.bind(null, validatingCallback), 24);

