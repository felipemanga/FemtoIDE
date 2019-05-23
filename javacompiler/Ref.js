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
            this.target = unit.resolve( this.name, this.trail, t=>!t.isType, this.scope );
        }
        return this.target;
    }
}

module.exports = {Ref};
