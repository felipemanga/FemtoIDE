const {Expression} = require("./Expression.js");
const getLocation = require("./getLocation.js");

let nextLabelId = 0;

class Statement {
    
    constructor(node, scope){
        this.scope = scope;
        this.unit = require("./Unit.js").getUnit(scope);
        if( !node ){
            this.type = null;
            return;
        }

        this.location = null;
        getLocation(this, node);
        
        this.defer(node);
        if( this.scope != scope )
            this.scope.stmt = this;
    }

    defer( node ){
        this.type = node.name;

        if( this[this.type] ){
            this[this.type]( node );
        }else{
            const {ast} = require("./AST.js");
            ast(node);
            console.log(node);
            throw new Error("Unknown Stmt: "+this.type);
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

    throwStatement( node ){
        this.expression = new Expression(
            node.children
                .expression[0],
            this.scope);
    }

    returnStatement( node ){
        if( node.children.expression )
            this.expression = new Expression(
                node.children
                    .expression[0],
                this.scope);
    }

    doStatement( node ){
        this.condition = new Expression(
            node.children.expression[0],
            this.scope
        );

        this.body = new Statement( node.children.statement[0], this.scope );
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

    statementExpression( node ){
        this.expression = new Expression(
            node.children.expression[0],
            this.scope );
    }

    expressionStatement( node ){
        
        this.expression = new Expression( node.children
                                          .statementExpression[0].children
                                          .expression[0],
                                        this.scope);
    }

    block( node ){
        const {Block} = require("./Block.js");
        let statements = node.children.blockStatements;
        this.block = new Block(statements && statements[0], this.scope );
    }

    continueStatement( node ){
        this.label = node.children.Identifier ? node.children.Identifier[0].image : null;
    }
    breakStatement( node ){
        this.label = node.children.Identifier ? node.children.Identifier[0].image : null;
    }

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
                block: new Block( cnode.children.blockStatements &&
                                  cnode.children.blockStatements[0],
                                  this.scope )

            }));
        
    }

    tryStatement( node ){
        const {Block} = require("./Block.js");
        const {Field} = require("./Field.js");
        
        this.tryBlock = new Statement(
            node.children.block[0],
            this.scope
        );

        if( !node.children.catches ){
            this.catches = [];
            return;
        }

        this.catches = node.children
            .catches[0].children
            .catchClause.map( cc => {
                let block;

                block = new Statement(
                    cc.children.block[0],
                    this.scope
                );
                
                let type = cc.children
                    .catchFormalParameter[0].children
                    .catchType[0].children
                    .unannClassType[0];
                
                let field = new Field(
                    null,
                    type,
                    cc.children
                        .catchFormalParameter[0].children
                        .variableDeclaratorId[0].children
                        .Identifier[0].image,
                    false,
                    null,
                    block
                );

                getLocation(field, 
                            cc.children
                            .catchFormalParameter[0].children
                            .variableDeclaratorId[0]
                           );

                return {field, block};
            });
    }
    
    labeledStatement( node ){
        let stmt = Object.values(node.children.statement[0].children)[0][0];
        this.defer( stmt );
        this.label = node.children.Identifier[0].image;
        this.labelId = nextLabelId++;
    }

    enhancedForStatement( node ){
        const {Block} = require("./Block.js");
        const {Field} = require("./Field.js");
        let bfs = node.children;

        this.iterable = new Expression(
            bfs.expression[0],
            this.scope
        );
        
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

        getLocation( this.iterator,
                     bfs.variableDeclaratorId[0]
                   );

        this.scope.locals.push( this.iterator );
        
        this.body = new Statement( bfs.statement[0], this.scope );
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

        if( bfs.forUpdate ){
            this.update = bfs.forUpdate[0].children
                .statementExpressionList[0].children
                .statementExpression.map( se => new Expression(
                    se.children.expression[0],
                    this.scope
                ) );
        }else{
            this.update = [];
        }

        this.body = new Statement( bfs.statement[0], this.scope );
    }
}

module.exports = {Statement};
