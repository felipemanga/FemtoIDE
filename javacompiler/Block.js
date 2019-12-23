const {ast} = require("./AST.js");
const getLocation = require("./getLocation.js");

class Block {
    constructor( node, scope ){
        this.localIndex = {};
        this.locals = [];
        this.init = [];
        this.statements = [];
        this.scope = scope;
        this.unit = require("./Unit.js").getUnit(scope);

        if( node && node.children && node.children.blockStatement ){
            getLocation(this, node);
            node.children.blockStatement.forEach( node => {
                node = Object.values(node.children)[0][0];
                this.addNode( node );
            });
        }
    }

    addNode( node ){
        (this[node.name]||this.notStatement).call( this, node );
    }

    notStatement( node ){
        ast(node);
    }

    statementExpressionList( node ){
        const {Statement} = require("./Statement.js");
        this.statements.push(
            ...node
                .children
                .statementExpression
                .map( stmt => new Statement( stmt, this ) )
        );
    }

    statement( node ){
        const {Statement} = require("./Statement.js");
        this.statements.push( new Statement( Object.values(node.children)[0][0], this ) );
    }

    resolve( fqcn, trail, test){
        fqcn = [...fqcn];
        let name = fqcn.shift();
        for( let field of this.locals ){
            if( field.name == name ){                
                trail.push( field );
                if( !fqcn.length && test(field) )
                    return field;
                return field.type.resolve( fqcn, trail, test);
            }
        }
        return null;
    }

    localVariableDeclaration(node){
        return this.localVariableDeclarationStatement(node);
    }

    localVariableDeclarationStatement(node){
        const {Field} = require("./Field.js");
        const {Statement} = require("./Statement.js");
        
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

                getLocation(field, 
                            varDeclNode.children
                            .variableDeclaratorId[0]
                           );

                if( this.localIndex[ field.name ] ){
                    const {StdError} = require("./StdError.js");
                    StdError.throwError(field.location, `Redeclaration of local variable ${field.name}`);
                }

                this.localIndex[ field.name ]  = field;

                this.locals.push( field );
                this.statements.push( new Statement( varDeclNode, this ) );

            });
    }
}

module.exports = {Block};
