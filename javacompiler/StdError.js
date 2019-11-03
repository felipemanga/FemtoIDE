let errorsEnabled = true;
let errorList = [];

class StdError extends Error {
    constructor( location, msg ){
        super(msg);
        this.location = location;
    }

    static enableErrors(enabled){
        errorsEnabled = enabled;
        errorList = [];
    }

    static getErrors(){
        return errorList;
    }

    static rethrow(ex){
        if( errorsEnabled ){
            throw ex;
        }else{
            errorList.push(ex.msg);
        }
    }

    static throwError(location, msg){
        msg = (location ? location.unit +
               ", line " + location.startLine +
               ", column " + location.startColumn +
               ":\n" : "") + msg;
        if( errorsEnabled ){
            throw new StdError(location, msg);
        }else{
            errorList.push(msg);
        }
    }
}

module.exports.StdError = StdError;
