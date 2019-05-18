module.exports = function (obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (ext) {
        if (ext) Object.keys(ext).forEach(function (key) {
            obj[key] = ext[key];
        });
    });
    return obj;
};