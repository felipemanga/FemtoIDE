
class StdError extends Error {
    constructor( location, msg ){
        super(msg);
        this.location = location;
    }

    static throwError(location, msg){
        msg = (location ? location.unit +
               ", line " + location.startLine +
               ", column " + location.startColumn +
               ":\n" : "") + msg;
        throw new StdError(location, msg);
    }
}

module.exports.StdError = StdError;
