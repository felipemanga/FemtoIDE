class AnnotationRef {
    constructor( node, scope ){
        const {TypeRef} = require("./TypeRef.js");
        const {ast} = require("./AST.js");
        const {Expression} = require("./Expression.js");

        this.scope = scope;
        this.unit = require("./Unit.js").getUnit(scope);
        
        this.name = node.children
                .typeName[0].children
                .Identifier
                .map(t=>t.image);

        this.type = null;
        this.trail = [];
        this.pairs = [];

        if( node.children
            .elementValuePairList ){
            let pairs = node.children
                .elementValuePairList[0].children
                .elementValuePair;
            
            this.pairs = pairs.map(evp=>{
                let key = evp.children.Identifier.map(k=>k.image);
                let value = new Expression(
                    evp.children.elementValue[0].children.expression[0],
                    scope
                );
                return {key, value};
            });
        }
        
    }

    getTarget(){
        if( this.type == null ){
            const {getUnit} =  require("./Unit.js");
            let unit = getUnit(this.scope);
            this.type = unit.resolve(this.name, this.trail, x=>x.isType, this.scope );
        }
        return this.type;
    }
    
}

module.exports.AnnotationRef = AnnotationRef;
