class ImportDeclaration {
    constructor( node ){
        this.fqcn = node.children.packageOrTypeName[0]
            .children.Identifier
            .map( node => node.image );
        this.star = !!node.children.Star;
        this.isStatic = !!node.children.Static;
    }
}

module.exports = ImportDeclaration;
