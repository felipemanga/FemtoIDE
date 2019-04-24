const {Unit, getUnit} = require("./Unit.js");

class Ref {
    constructor( name, scope ){
        this.scope = scope;
        this.name = name;
        this.target = null;
        this.trail = [];
        this.operation = "resolve";
        // if( this.name == "this" ){
        //     this.target = scope;
        //     while( !this.target.isClass ){
        //         this.target = this.target.scope;
        //     }
        // }

    }

    getTarget( dbg ){
        if( !this.target ){
            let unit = getUnit( this.scope );
            this.target = unit.resolve( this.name, this.trail, this.scope, dbg );
        }else if(dbg){
            console.log( this.name, " already resolved", this.trail );
        }
        return this.target;
    }
}

module.exports = {Ref};
