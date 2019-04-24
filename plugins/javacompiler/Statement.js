const {Expression} = require("./Expression.js");

class Statement {
    
    constructor(node, scope){
        this.scope = scope;
        this.defer(node);
    }

    defer( node ){
        this.type = node.name;

        if( this[this.type] ){
            this[this.type]( node );
        }else{
            ast(node);
            console.log(node);
            throw ("Unknown Stmt: "+this.type);
        }
    }

    statement( node ){
        this.defer( Object.values(node.children)[0][0] );
    }

    statementWithoutTrailingSubstatement( node ){
        this.defer( Object.values(node.children)[0][0] );
    }

    emptyStatement( node ){
    }

    returnStatement( node ){
        if( node.children.expression )
            this.expression = new Expression(
                node.children
                    .expression[0],
                this.scope);
    }

    whileStatement( node ){
        this.condition = new Expression(
            node.children.expression[0],
            this.scope
        );

        this.body = new Statement( node.children.statement[0], this.scope );
    }

    ifStatement( node ){
        this.condition = new Expression(
            node.children.expression[0],
            this.scope
        );

        this.body = new Statement( node.children.statement[0], this.scope );

        if( node.children.statement[1] )
            this.else = new Statement( node.children.statement[1], this.scope );

    }
    
    variableDeclarator( node ){

        this.name = node.children
            .variableDeclaratorId[0].children
            .Identifier[0].image;
        
        this.expression = node.children.Equals && new Expression( node, this.scope );
        
    }

    expressionStatement( node ){
        
        this.expression = new Expression( node.children
                                          .statementExpression[0].children
                                          .expression[0],
                                        this.scope);
    }

    block( node ){
        const {Block} = require("./Block.js");
        this.block = new Block(node.children.blockStatements[0], this.scope );
    }

    continueStatement( node ){}
    breakStatement( node ){}

    switchStatement( node ){
        const {Block} = require("./Block.js");
        this.expression = new Expression( node.children
                                          .expression[0],
                                        this.scope);
        this.cases = node
            .children
            .switchBlock[0]
            .children
            .switchCase.map( cnode => ({
                value: (cnode.children
                    .switchLabel[0].children
                    .constantExpression
                    ?
                    new Expression( cnode.children
                                    .switchLabel[0].children
                                    .constantExpression[0].children
                                    .expression[0],
                                    this.scope )
                    :
                    undefined),
                block: new Block( cnode.children
                                  .blockStatements[0],
                                  this.scope )

            }));
        
    }

    enhancedForStatement( node ){
        const {Block} = require("./Block.js");
        const {Field} = require("./Field.js");
        let bfs = node.children;

        this.scope = new Block(
            null,
            this.scope
        );

        this.iterator = new Field(
            null,
            bfs.localVariableType[0].children.unannType[0],
            bfs.variableDeclaratorId[0].children.Identifier[0].image,
            false,
            null,
            this.scope
        );
    }

    forStatement( node ){
        if( node.children.enhancedForStatement )
            return this.defer( node.children.enhancedForStatement[0] );

        let bfs = node.children
            .basicForStatement[0].children;

        const {Block} = require("./Block.js");
        this.scope = new Block(
            {children:{blockStatement:bfs.forInit}},
            this.scope
        );

        this.init = this.scope.statements;
        this.scope.statements = [];

        this.condition = new Expression(
            bfs.expression[0],
            this.scope
        );

        this.update = bfs.forUpdate[0].children
            .statementExpressionList[0].children
            .statementExpression.map( se => new Expression(
                se.children.expression[0],
                this.scope
            ) );

        this.body = new Statement( bfs.statement[0], this.scope );
    }
}

module.exports = {Statement};
