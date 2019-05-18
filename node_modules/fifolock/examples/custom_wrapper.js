// silly demonstration of custom wrapper usage

var q = require("../")();

var RANDOM_WRAPPER = q.TRANSACTION_WRAPPER.bind({
    postAcquire: function (proceed) {
        // normally this might open a file, or set a h/w pin high, or acquire some other lock, or…
        var signal = Math.random();
        proceed(signal);    // often called asyncronously, but no need to do so here.
    },
    preRelease: function (finish, args) {
        // this might close the file, set the h/w pin low, etc.
        if (args[0]) console.log("Looks like callback will get an error.");
        else console.log("Callback is not getting error.");
        finish();   // like `proceed` above, `finish` can be called async, or right away.
    }
});


function failIfAbove(n, cb) { cb = RANDOM_WRAPPER(cb, function (signal) {
    if (signal > n) cb(new Error("Value above threshold."));
    else cb(null);
}); }

function failIfBelow(n, cb) { cb = RANDOM_WRAPPER(cb, function (signal) {
    if (signal < n) cb(new Error("Value below threshold."));
    else cb(null);
}); }

failIfAbove(0.1, function () {});
failIfBelow(0.2, function () {});
failIfAbove(0.4, function () {});
failIfBelow(0.8, function () {});
failIfBelow(0.4, function () {});
failIfAbove(0.2, function () {});
failIfBelow(0.1, function () {});
