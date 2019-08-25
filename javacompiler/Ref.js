const {Unit, getUnit} = require("./Unit.js");

class Ref {
    constructor( name, scope ){
        this.scope = scope;
        this.name = name;
        this.target = null;
        this.trail = [];
        this.operation = "resolve";
        this.isType = false;
        this.isTypeRef = false;
        this.unit = require("./Unit.js").getUnit(scope);
        this.location = null;
        
        // if( this.name == "this" ){
        //     this.target = scope;
        //     while( !this.target.isClass ){
        //         this.target = this.target.scope;
        //     }
        // }

    }

    getTarget(){
        if( !this.target ){
            let unit = getUnit( this.scope );

            try{
                this.target = unit.resolve( this.name, this.trail, t=>!t.isType, this.scope );
            }catch(ex){
                if( this.location && this.location.startLine && ex.message ){
                    const {StdError} = require("./StdError.js");
                    StdError.throwError(this.location, ex.message || ex);
                }else
                    throw ex;
            }
        }
        return this.target;
    }
}

module.exports = {Ref};
