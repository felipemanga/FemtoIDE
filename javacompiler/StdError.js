
class StdError extends Error {
    constructor( location, msg ){
        super(msg);
        this.location = location;
    }
}

module.exports.StdError = StdError;
