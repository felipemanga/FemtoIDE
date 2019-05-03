const {nativeTypeList} = require("./Type.js");
const {getUnit} = require("./Unit.js");

class TypeRef {
    constructor( node, isArray, scope ){

        this.scope = scope;
        this.type = null;
        this.trail = [];

        if( Array.isArray(node) && typeof node[0] == "string" ){

            this.name = node;
            this.isArray = isArray;
            this.isReference = isArray
                || node.length > 1
                || nativeTypeList.indexOf(node[0]) == -1;

        }else{

            if( node.name == "unannType" )
                node = Object.values(node.children)[0][0];

            if( Array.isArray(node) )
                node = node[0];

            this.isReference = (
                node.name == "unannReferenceType"
                    || node.name == "referenceType"
            );

            this.isArray = this.isReference && (node.children.dims) && true;

            let nc = node;

            if( this.isReference ){
                nc = Object.values(nc.children)[0][0];
            }

            if( nc.name == "classOrInterfaceType" ){
                this.name = nc.children
                    .classType[0]
                    .children
                    .Identifier
                    .map( idNode => idNode.image );
            }else if( nc.name == "unannClassOrInterfaceType" ){
                this.name = nc.children
                    .unannClassType[0]
                    .children
                    .Identifier
                    .map( idNode => idNode.image );
            }else if( nc.image ){
                this.name = nc.image;
            }else if( nc.children.Boolean ){
                this.name = "boolean";
            }else{
                this.name = Object.values(
                    Object.values(
                        Object.values(nc.children)[0][0].children
                    )[0][0].children
                )[0][0].image;
            }

            if( this.isReference && this.name.length == 1 && nativeTypeList.indexOf(this.name[0]) != -1 ){
                this.isReference = false;
            }
        }

        if( isArray ){
            this.isArray = true;
            this.isReference = true;
        }

        if(!this.name){
            ast(node);
            console.log("Bad typeref: ", this);
            throw "Bacon";
        }
    }

    getTarget(){
        if( this.type == null ){
            const {getUnit} =  require("./Unit.js");
            let unit = getUnit(this.scope);
            this.type = unit.resolve(this.name, this.trail, this.scope);
        }
        return this.type;
    }

    resolve( fqcn, trail ){

        if( this.isArray ){
            let unit = getUnit(this.scope);
            return unit
                .resolve("Array", [], this.scope)
                .resolve( fqcn, trail );
        }

        // console.log("FQCN TypeRef: ", fqcn);
        return this.getTarget().resolve( fqcn, trail );                
    }
}

module.exports = {TypeRef};
