
class Block {
    constructor( node, scope ){
        const {Field} = require("./Field.js");
        const {Statement} = require("./Statement.js");

        this.locals = [];
        this.init = [];
        this.statements = [];
        this.scope = scope;

        if( node ){
            node.children.blockStatement.forEach( node => {
                node = Object.values(node.children)[0][0];
                if( node.name == "localVariableDeclarationStatement" || node.name == "localVariableDeclaration" ){
                    let declNode;
                    if( node.name == "localVariableDeclaration" )
                        declNode = node;
                    else
                        declNode = Object.values(node.children)[0][0];

                    let type = declNode.children
                        .localVariableType[0].children
                        .unannType[0];

                    declNode.children
                        .variableDeclaratorList[0].children
                        .variableDeclarator
                        .forEach( varDeclNode => {
                            let field = new Field(
                                null, // To-do: modifiers
                                type,
                                varDeclNode.children
                                    .variableDeclaratorId[0].children
                                    .Identifier[0].image,
                                varDeclNode.children
                                    .variableDeclaratorId[0].children
                                    .dims,
                                null,
                                this
                            );

                            this.locals.push( field );
                            this.statements.push( new Statement( varDeclNode, this ) );

                        });
                }else if( node.name != "statement" ){
                    ast(node);
                    throw "Eh?!";
                }else{// if( node.children.statementWithoutTrailingSubstatement ){
                    this.statements.push( new Statement( Object.values(node.children)[0][0], this ) );
                }
            });
        }
    }

    resolve( fqcn, trail ){
        // console.log("FQCN block: ", fqcn);
        fqcn = [...fqcn];
        let name = fqcn.shift();
        for( let field of this.locals ){
            if( field.name == name ){
                trail.push( field );
                return field.type.resolve( fqcn, trail );
            }
        }
        return null;
    }
}

module.exports = {Block};
