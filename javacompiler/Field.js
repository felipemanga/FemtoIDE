
class Field {
    constructor( modifier, type, name, isArray, init, scope ){
        const {Statement} = require("./Statement.js");
        const {TypeRef} = require("./TypeRef.js");

        this.isPublic = false;
        this.isStatic = false;
        this.isFinal = false;
        this.isVolatile = false;

        if( modifier ){
            modifier.forEach(mod=>{
                let key = Object.keys(mod.children)[0];
                if( key == "Public" ) this.isPublic = true;
                else if( key == "Static" ) this.isStatic = true;
                else if( key == "Final" ) this.isFinal = true;
                else if( key == "Volatile" ) this.isVolatile = true;
            });
        }

        this.type = new TypeRef(type, isArray, scope);
        this.name = name;

        if( init )
            this.init = new Statement(init, scope);
    }
}

module.exports = {Field};
