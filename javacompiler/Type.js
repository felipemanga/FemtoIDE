let {Unit, getUnit} = require("./Unit.js");
const getLocation = require("./getLocation.js");

const nativeTypeList = "long,ulong,int,uint,short,ushort,char,byte,ubyte,boolean,float,void,double,pointer".split(",");

let typeId = 1;

class Type {

    constructor( node, key, cppType, parent ){
        this.scope = parent;
        this.cppType = cppType;
        this.id = typeId++;
        this.isType = true;
        this.unit = require("./Unit.js").getUnit(this.scope);
        this.location = null;
        
        if( typeof node == "string" ){
            this.name = node;
            this.isPublic = true;
            this.isNative = false;
            return;
        }

        getLocation(this, node);
        
        let modifierNode = (node.children.classModifier||[])[0];
        this.isPublic = (modifierNode && !!modifierNode.children.Public) || false;
        if( !key ){
            this.name = "__anon__" + typeId;
        }else{
            let declNode = (node.children[ key ]||[])[0];
            if( !declNode )
                throw new Error("Expected " + key + JSON.stringify(node));
            
            let identNode = (declNode.children.typeIdentifier||[])[0];
            if( !identNode )
                throw new Error("Expected typeIdentifier");

            this.name = identNode.children
                .Identifier[0].image.replace(/^__(.*?)_internal_placeholder__$/, "$1");

            this.isNative = nativeTypeList.indexOf(this.name) != -1;
        }
        
    }

    isOfType( other ){
        if( other.getTarget )
            other = other.getTarget();

        if( this == other )
            return true;

        if( this.isNative || other.isNative )
            return false;

        if( this.extends && this.extends.name[0] != "__raw__" && this.extends.getTarget().isOfType(other) )
            return true;

        return this.implements.find( clazzref => clazzref.name[0] != "__stub__" && clazzref.getTarget().isOfType(other) );
    }
}

module.exports = { Type, nativeTypeList };
