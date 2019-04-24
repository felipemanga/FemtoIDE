class Interface extends Type {
    constructor( node, parent ){
        super(node, "normalInterfaceDeclaration", "class", parent);
        this.isInterface = true;
    }
}

module.exports = Interface;
