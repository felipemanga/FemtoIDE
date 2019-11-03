let _logger = (...args)=>console.log(...args);
module.exports.setLogger = logger=>_logger = logger;
module.exports.log = (...args) => _logger(...args);
