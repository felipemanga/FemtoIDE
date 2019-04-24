const Type = require("./Type.js");

class EnumConstant {
    constructor(node){
        this.name = node.children.Identifier[0].image;
    }
}

class Enum extends Type {
    constructor( node, parent ){
        super(node, "enumDeclaration", "enum class", parent);
        // ast(node);
        this.constantList = node.children
            .enumDeclaration[0].children
            .enumBody[0].children
            .enumConstantList[0].children
            .enumConstant.map( ec => new EnumConstant(ec) );
    }
}

module.exports = { Enum, EnumConstant };
