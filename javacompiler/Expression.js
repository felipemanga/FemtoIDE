const {Ref} = require("./Ref.js");
const {TypeRef} = require("./TypeRef.js");
const {ast} = require("./AST.js");

let srcExpr;

class Expression {
    constructor( expr, scope, opts ){
        this.scope = scope;
        srcExpr = expr;
        this.dispatch(expr, opts);
    }

    dispatch(expr, opts){
        this.name = expr.name;
        this.node = expr;
        if( this[ expr.name ] )
            this[expr.name]( expr, opts );
        else{
            console.error("Invalid expr: ", expr, this.scope);
            ast(srcExpr);
            expr[0][0][0][0] = 1;
        }
    }

    variableDeclarator(expr){
        this.left = new Ref([
            expr
                .children
                .variableDeclaratorId[0]
                .children
                .Identifier[0]
                .image], this.scope);

        let init = expr
            .children
            .variableInitializer[0]
            .children;

        if( init.arrayInitializer ){
            this.right = init.arrayInitializer[0]
                .children
                .variableInitializerList[0]
                .children
                .variableInitializer
                .map( ai => new Expression( ai
                                            .children
                                            .expression[0],
                                            this.scope) );
        }else{
            this.right = new Expression( init
                                         .expression[0],
                                         this.scope
                                       );
        }
        this.operation = "=";
    }

    referenceType(expr){
        this.left = new TypeRef(
            expr.children.classOrInterfaceType[0],
            false,
            this.scope
        );
        this.operation = "referenceType";
    }

    expression(expr, opts){
        this.dispatch( Object.values(expr.children)[0][0], opts );
    }

    ternaryExpression(expr, opts){
        if( !expr.children.QuestionMark )
            return this.dispatch( Object.values(expr.children)[0][0], opts );
        this.operation = "ternary";
        this.condition = new Expression( expr.children.binaryExpression[0], this.scope );
        this.left = new Expression( expr.children.expression[0], this.scope );
        this.right = new Expression( expr.children.expression[1], this.scope );
    }

    binaryExpression(expr, opts){

        if( expr.children.BinaryOperator ){
            
            let operations = expr
                .children
                .BinaryOperator
                .map(b=>b.image);
            
            let values = expr
                .children
                .unaryExpression
                .map( x => new Expression(x, this.scope) );
            
            let priorities = operations.map(op => ({
                '*':12,
                '/':12,
                '%':12,
                '+':11,
                '-':11,
                '<<':10,
                '>>':10,
                '>>>':10,
                '<':9,
                '>':9,
                '<=':9,
                '>=':9,
                'instanceof':9,
                '==':8,
                '!=':8,
                '&':7,
                '^':6,
                '|':5,
                '&&':4,
                '||':3
            })[op] || 1);

            let iter = 10;
            do{

                let highest = priorities[0], highestId = 0;
                for( let i=1; i<priorities.length; ++i ){
                    if( priorities[i] > highest ){
                        highest = priorities[i];
                        highestId = i;
                    }
                }
                
                let tmp = {
                    name: "binaryExpression",
                    operation:operations[highestId],
                    left:values[highestId],
                    right:values[highestId+1]
                };

                priorities.splice(highestId, 1);
                operations.splice(highestId, 1);
                values.splice(highestId, 2, tmp);

            }while( values.length > 1 );

            Object.assign( this, values[0] );
            
            return;
        }else if( expr.children.AssignmentOperator ){

            this.operation = expr.children
                .AssignmentOperator[0].image;

            let right =  new Expression( expr.children.expression[0], this.scope );
            
            let nopts = null;
            if( this.operation == "=" ){
                nopts = {
                    isLValue:_=>{
                        let ret = right;
                        right = null;
                        return ret;
                    }
                };
            }

            this.left = new Expression( expr.children.unaryExpression[0], this.scope, nopts );

            this.right = right;
            return;
        }else if( expr.children.Instanceof ){
            this.operation = "instanceof";
            this.left = new Expression( expr.children.unaryExpression[0], this.scope );
            this.right = new Expression( expr.children.referenceType[0], this.scope );
            return;
        }

        this.dispatch( expr.children.unaryExpression[0] );

    }

    unaryExpressionNotPlusMinus(expr){
        this.name = "unaryExpression";
        this.unaryExpression(expr);
    }

    unaryExpression(expr, opts){

        if( expr.children.UnarySuffixOperator ){

            this.operation = expr.children.UnarySuffixOperator[0].image;
            this.left = new Expression( expr.children.primary[0], this.scope );

        }else if( expr.children.UnaryPrefixOperator ){

            this.operation = expr.children.UnaryPrefixOperator[0].image;
            this.right = new Expression( expr.children.primary[0], this.scope );

        }else{
            this.dispatch( expr.children.primary[0], opts );
        }
    }

    arrayAccessSuffix( expr, opts ){
        this.operation = this.name;
        this.right = new Expression(
            expr.children.expression[0],
            this.scope
        );
    }

    methodInvocationSuffix( expr ){
        this.operation = this.name;

        if( !expr.children.argumentList ){
            this.args = [];
            return;
        }
        this.args = expr.children
            .argumentList[0].children
            .expression
            .map( arg => new Expression( arg, this.scope ) );
    }

    primary( expr, opts ){
        let left = expr
            .children
            .primaryPrefix[0]
            .children;
        
        if( left.fqnOrRefType ){
            let ref = left
                .fqnOrRefType[0]
                .children
                .fqnOrRefTypePart.map( part =>{
                    return part.children.Super ? "super" : part
                        .children
                        .Identifier[0]
                        .image;
                });
            let match;
            if( ref.length == 1 && (match=ref[0].match(/^__inline_([^_]+)__$/)) ){
                this.operation = "inline";
                this.backend = match[1];
                this.lines = expr.children
                    .primarySuffix[0].children
                    .methodInvocationSuffix[0].children
                    .argumentList[0].children
                    .expression.map( line => line.children
                                     .ternaryExpression[0].children
                                     .binaryExpression[0].children
                                     .unaryExpression[0].children
                                     .primary[0].children
                                     .primaryPrefix[0].children
                                     .literal[0].children
                                     .StringLiteral[0].image
                                   ).map( x => x
                                          .substr(1, x.length-2 )
                                          .replace(/\\(.)/g, '$1') );

                return;
            }
            
            this.left = new Ref(
                ref,
                this.scope
            );

            this.operation = "access";
            
        }else if( left.literal ){
            this.literalType = Object.keys(left.literal[0].children)[0];

            if( this.literalType == "StringLiteral" || this.literalType == "CharLiteral" || this.literalType == "Null" ){
                this.left = left
                    .literal[0]
                    .children[this.literalType][0]
                    .image;
            }else{
                let litchild = left.literal[0]
                    .children[this.literalType][0]
                    .children;
                if( !litchild )
                    ast(left.literal[0]);
                this.left = Object.values(litchild)[0][0].image;
            }

            this.operation = "literal";

        }else if( left.newExpression ){
            let isArray = !!left.newExpression[0].children
                .arrayCreationExpression;
            // ast(expr);
            this.operation = "new";
            if( isArray ){
                this.array = left
                    .newExpression[0].children
                    .arrayCreationExpression[0].children
                    .arrayCreationDefaultInitSuffix[0].children
                    .dimExprs[0].children
                    .dimExpr
                    .map( expr => new Expression( expr.children.expression[0] ) );
            }
            let ex = Object.values(left.newExpression[0].children)[0][0];
            if( isArray ){
                if( ex.children.classOrInterfaceType ){
                    this.left = new TypeRef(
                        ex.children
                            .classOrInterfaceType[0].children
                            .classType[0].children
                            .Identifier.map( i=>i.image ),
                        true,
                        this.scope
                    );
                }else if( ex.children.primitiveType ){
                    this.left = new TypeRef(
                        [Object.values(
                            //integralType
                            Object.values(
                                // numericType
                                Object.values(
                                    ex.children.primitiveType[0].children
                                )[0][0].children
                            )[0][0].children
                        )[0][0].image],
                        true,
                        this.scope
                    );
                }
            }else{
                let ucice = left.newExpression[0].children
                    .unqualifiedClassInstanceCreationExpression[0];
                
                if( ucice.children.classBody ){
                    const Clazz = require("./Clazz.js");
                    let clazz = new Clazz( ucice, this.scope );
                    this.left = new TypeRef(
                        null,
                        false,
                        this.scope,
                        clazz
                    );
                }else{
                    this.left = new TypeRef(
                        ucice.children.classOrInterfaceTypeToInstantiate
                            .map( i=>i.children.Identifier[0].image ),
                        false,
                        this.scope
                    );
                }
                
                let args = left
                    .newExpression[0]
                    .children
                    .unqualifiedClassInstanceCreationExpression[0]
                    .children
                    .argumentList;

                if( args ){
                    this.args = args[0]
                        .children
                        .expression
                        .map(e=> new Expression(e, this.scope));
                }else{
                    this.args = [];
                }
            }
        }else if( left.parenthesisExpression ){
            this.operation = "parenthesis";
            this.left = new Expression(
                left.parenthesisExpression[0].children.expression[0],
                this.scope
            );
        }else if( left.castExpression ){
            this.operation = "cast";
            let children = left.castExpression[0].children;
            let pce;
            if( (pce = children.primitiveCastExpression) ){
                pce = pce[0].children;
                this.type = new TypeRef(
                    pce.primitiveType[0],
                    false,
                    this.scope
                );
                this.left = new Expression(
                    pce.unaryExpression[0],
                    this.scope
                );
            }else if( (pce=children.referenceTypeCastExpression) ){
                pce = pce[0].children;
                this.type = new TypeRef(
                    pce.referenceType[0],
                    false,
                    this.scope
                );
                this.left = new Expression(
                    pce.unaryExpressionNotPlusMinus[0],
                    this.scope
                );
            }
        }else if( left.This ){
            this.operation = "access";
            this.left = new Ref("this", this.scope);
        }else{
            console.error( "ERROR: unknown primary ", left );
        }

        let suffix = expr.children.primarySuffix;
        if( suffix ){
            let op;
            this.right = suffix.map( s =>{
                op = Object.keys(s.children)[0];
                if( op == "Dot" ){
                    return s.children.Identifier[0].image;
                }else{
                    op = new Expression( s
                                           .children
                                            [op][0],
                                            this.scope
                                       );
                    return op;
                }
            });
            
            if( op && op.operation )
                op.isLValue = opts && opts.isLValue();
        }
    }
}

module.exports = {Expression};
