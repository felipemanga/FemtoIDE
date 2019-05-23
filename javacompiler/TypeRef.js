const {nativeTypeList} = require("./Type.js");
const {getUnit} = require("./Unit.js");

class TypeRef {
    constructor( node, isArray, scope, type ){

        this.scope = scope;
        this.type = type || null;
        this.isTypeRef = true;

        if( type ){
            if( type.isTypeRef ){
                console.error("TRE: ", type.constructor.name);
                type[0][0][0] = 1;
            }
            this.name = type.name;
            this.isReference = true;
            this.isArray = false;
            return;
        }

        this.trail = [];

        if( Array.isArray(node) && typeof node[0] == "string" ){

            this.name = node;
            this.isArray = isArray;
            this.isReference = isArray
                || node.length > 1
                || nativeTypeList.indexOf(node[0]) == -1;

        }else{

            if( node.name == "unannType" || node.name == "unannClassType" )
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
                this.isReference = true;
                this.name = nc.children
                    .classType[0]
                    .children
                    .Identifier
                    .map( idNode => idNode.image );
            }else if( nc.name == "unannClassOrInterfaceType" || nc.name == "unannClassType" ){
                this.isReference = true;
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
            const {ast} = require("./AST.js");
            ast(node);
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

    resolve( fqcn, trail, test ){

        if( trail == this.trail )
            return null;

        if( this.isArray ){
            let unit = getUnit(this.scope);
            return unit
                .resolve("Array", [], x=>x.isType, this.scope)
                .resolve( fqcn, trail, test );
        }

        let target = this.getTarget();
        
        if( !target.resolve ){
            let ctx = target, str=[];
            while(ctx){
                str.unshift(ctx.name);
                ctx = ctx.scope;
            }
            throw new Error(`Resolve ${fqcn.join(".")} on ${target && target.constructor.name} in ${str.join(" in ")}`);
        }
        return target.resolve( fqcn, trail, test );                
    }
}

module.exports = {TypeRef};
