const {ast} = require("./AST.js");

class Constructor {
    constructor( node, scope ){
        const {Field} = require("./Field.js");
        const {TypeRef} = require("./TypeRef.js");
        const {Block} = require("./Block.js");

        this.isConstructor = true;
        this.scope = scope;
        let modifier = node.children.constructorModifier || [];
        let headNode = node.children.constructorDeclarator;

        let bodyChildren = node.children.constructorBody[0].children;
        let bodyNode = bodyChildren.blockStatements;

        if( bodyNode )
            bodyNode = bodyNode[0];

        this.superArgs = [];

        if( bodyChildren.explicitConstructorInvocation ){
            const {Expression} = require("./Expression.js");

            this.superArgs = bodyChildren
                .explicitConstructorInvocation[0]
                .children
                .unqualifiedExplicitConstructorInvocation[0]
                .children
                .argumentList[0]
                .children
                .expression
                .map( node => new Expression(node, this) );
            
        }

        this.isPublic = false;
        modifier.forEach(mod=>{
            let key = Object.keys(mod.children)[0];
            if( key == "Public" ) this.isPublic = true;
        });

        this.name = headNode[0]
            .children
            .simpleTypeName[0]
            .children
            .Identifier[0]
            .image;

        if( !headNode[0].children.formalParameterList )
            this.parameters = [];
        else{
            this.parameters = headNode[0]
                .children
                .formalParameterList[0]
                .children
                .formalParameter.map( param => {
                    let vprp = param.children.variableParaRegularParameter[0];
                    return new Field(
                        null,
                        vprp.children.unannType[0],
                        vprp.children
                            .variableDeclaratorId[0]
                            .children
                            .Identifier[0]
                            .image,
                        vprp.children
                            .variableDeclaratorId[0]
                            .children
                            .dims,
                        null,
                        scope
                    );
                });
        }

        if( bodyNode )
            this.body = new Block(bodyNode, this);

    }

    resolve( fqcn, trail ){
        // console.log("FQCN constructor: ", fqcn);
        fqcn = [...fqcn];
        let name = fqcn.shift();
        for( let field of this.parameters ){
            if( field.name == name ){
                trail.push( field );
                return field.type.resolve( fqcn, trail );
            }
        }
        return null;
    }

}

class Method {
    constructor( node, scope ){
        this.scope = scope;
        this.isPublic = false;
        this.isStatic = false;
        this.isAbstract = false;
        this.isMethod = true;
        this.parameters = [];

        if( !node )
            return;

        if( node.name == "interfaceMethodDeclaration" ){
            this.isAbstract = !node.children.methodBody ||
                !node.children.methodBody[0].children.block;
        }

        const {Field} = require("./Field.js");
        const {TypeRef} = require("./TypeRef.js");
        const {Block} = require("./Block.js");

        let modifier = node.children.methodModifier || [];
        let headNode = node.children.methodHeader;

        modifier.forEach(mod=>{
            let key = Object.keys(mod.children)[0];
            if( key == "Public" ) this.isPublic = true;
            else if( key == "Static" ) this.isStatic = true;
            else if( key == "Abstract" ) this.isAbstract = true;
        });

        let bodyNode;

        if( !this.isAbstract ){
            if( !node.children.methodBody
                || !node.children.methodBody[0].children.block
              ){
                ast( node );
            }

            bodyNode = node.children
                .methodBody[0].children
                .block[0].children
                .blockStatements;

            if( bodyNode )
                bodyNode = bodyNode[0];
        }

        let resultNode = Object.values(
            headNode[0]
                .children
                .result[0]
                .children
        )[0][0];

        this.result = new TypeRef(resultNode, false, scope);

        this.name = headNode[0]
            .children
            .methodDeclarator[0]
            .children
            .Identifier[0]
            .image;

        if( headNode[0].children.methodDeclarator[0].children.formalParameterList ){
            this.parameters = headNode[0]
                .children
                .methodDeclarator[0]
                .children
                .formalParameterList[0]
                .children
                .formalParameter.map( param => {
                    let vprp = param.children.variableParaRegularParameter[0];
                    return new Field(
                        null,
                        vprp.children.unannType[0],
                        vprp.children
                            .variableDeclaratorId[0]
                            .children
                            .Identifier[0]
                            .image,
                        vprp.children
                            .variableDeclaratorId[0]
                            .children
                            .dims,
                        null,
                        scope
                    );
                });
        }

        if( bodyNode )
            this.body = new Block(bodyNode, this);

    }

    artificial( retType, name, args, body ){
        this.result = retType;
        this.name = name;
        this.parameters.push( ...args );
        this.body = body;
    }

    resolve( fqcn, trail ){
        // console.log("FQCN method: ", fqcn);
        fqcn = [...fqcn];
        let name = fqcn.shift();

        for( let field of this.parameters ){
            if( field.name == name ){
                trail.push( field );
                return field.type.resolve( fqcn, trail );
            }
        }
        return null;
    }

}

module.exports = { Method, Constructor };

