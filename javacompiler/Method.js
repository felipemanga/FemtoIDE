const {ast} = require("./AST.js");
const getLocation = require("./getLocation.js");

let nextId = 0;

function propagateUseToDependencies(method){
    if(method.useCount)
        return;
    method.useCount = 1;
    let dependencies = Object.values(method.dependencies);
    for(let dependency of dependencies){
        if(dependency.useCount) continue;
        propagateUseToDependencies( dependency );
    }
}

class Constructor {
    constructor( node, scope ){
        const {Field} = require("./Field.js");
        const {TypeRef} = require("./TypeRef.js");
        const {Block} = require("./Block.js");

        this.uniqueId = ++nextId;
        this.isConstructor = true;
        this.scope = scope;
        this.superArgs = [];
        this.isPublic = false;
        this.parameters = [];
        this.unit = require("./Unit.js").getUnit(scope);
        this.location = null;
        this.node = node;
        this.useCount = 0;
        this.dependencies = {};

        if( typeof node == "string" ){
            this.name = node;
            return;
        }
        
        let modifier = node.children.constructorModifier || [];
        let headNode = node.children.constructorDeclarator;

        getLocation(this, headNode);

        let bodyChildren = node.children.constructorBody[0].children;
        let bodyNode = bodyChildren.blockStatements;

        if( bodyNode )
            bodyNode = bodyNode[0];

        if( bodyChildren.explicitConstructorInvocation ){
            const {Expression} = require("./Expression.js");

            if( bodyChildren
                .explicitConstructorInvocation[0]
                .children
                .unqualifiedExplicitConstructorInvocation[0]
                .children
                .argumentList ){
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
        }

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

        if( this.name != scope.name ){
            throw new Error("Invalid method declaration; return type required for \"" + this.name + "\" in \"" + this.scope.name + "\"");
        }

        if( headNode[0].children.formalParameterList ){
            this.parameters = headNode[0]
                .children
                .formalParameterList[0]
                .children
                .formalParameter.map( param => {
                    let vprp = param.children.variableParaRegularParameter[0];
                    let field = new Field(
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

                    getLocation(field, 
                                vprp.children
                                .variableDeclaratorId[0]
                               );
                    
                    return field;
                });
        }

        if( bodyNode )
            this.body = new Block(bodyNode, this);

    }

    propagateUseToDependencies(){
        propagateUseToDependencies(this);
    }

    resolve( fqcn, trail, test ){
        fqcn = [...fqcn];
        let name = fqcn.shift();

        for( let field of this.parameters ){
            if( field.name == name ){
                if( !fqcn.length ){
                    if( !test(field) )
                        continue;
                    trail.push( field );
                    return field;
                }
                
                trail.push( field );
                return field.type.resolve( fqcn, trail, test );
            }
        }
        return null;
    }

}

class Method {
    constructor( node, scope ){
        this.uniqueId = ++nextId;
        this.scope = scope;
        this.isPublic = false;
        this.isStatic = false;
        this.isAbstract = false;
        this.isMethod = true;
        this.parameters = [];
        this.annotations = [];
        this.unit = require("./Unit.js").getUnit(scope);
        this.location = null;
        this.node = node;
        this.useCount = 0;
        this.overridden = undefined;
        this.dependencies = {};
        
        if( !node )
            return;

        getLocation(this, node);

        if( node.name == "interfaceMethodDeclaration" ){
            this.isAbstract = !node.children.methodBody ||
                !node.children.methodBody[0].children.block;
        }

        const {Field} = require("./Field.js");
        const {TypeRef} = require("./TypeRef.js");
        const {Block} = require("./Block.js");
        const {AnnotationRef} = require("./AnnotationRef.js");

        let modifier = node.children.methodModifier || [];
        let headNode = node.children.methodHeader;

        modifier.forEach(mod=>{
            let key = Object.keys(mod.children)[0];
            if( key == "Public" ) this.isPublic = true;
            else if( key == "Static" ) this.isStatic = true;
            else if( key == "Abstract" ) this.isAbstract = true;
            else if( key == "Private" ) this.isPublic = false;
            else if( key == "annotation" )
                this.annotations.push( new AnnotationRef(mod.children.annotation[0], this) );
            else console.log("Unknown key: " + key);
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
                    let field = new Field(
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

                    getLocation(field, 
                                vprp.children
                                .variableDeclaratorId[0]
                               );
                    
                    return field;
                });
        }

        if( bodyNode )
            this.body = new Block(bodyNode, this);

    }

    propagateUseToDependencies(){
        propagateUseToDependencies(this);
    }

    propagateUseToBase(){
        if(!this.useCount)
            return;
        let over = this.getOverridden();
        while(over && !over.useCount){
            propagateUseToDependencies(over);
            over = over.getOverridden();
        }
    }

    propagateUseToDerived(){
        // let over = this.getOverridden();
        for( let over of this.getAllOverridden() ){
            // while(over && !this.useCount){
                if(over.useCount)
                    propagateUseToDependencies(this);
            // over = over.getOverridden();
        }
    }

    getAllOverridden(arr=[], scope=this.scope){
        let other = scope.methods.find(method=>{
            if(method == this)
                return false;
            if( method.name != this.name || method.parameters.length != this.parameters.length )
                return false;
            return !method.parameters.find(
                (other, i)=>other.type.getTarget() != this.parameters[i].type.getTarget()
            );
        });

        if(other)
            arr.push(other);
        
        if(scope.extends){
            let base = scope.extends.getTarget();
            if(base)
                this.getAllOverridden(arr, base);
        }

        if(scope.implements){
            for( let baseRef of scope.implements ){
                if( baseRef.name.length == 1 && (
                    baseRef.name == "__stub__" ||
                    baseRef.name == "__stub_only__" ||
                    baseRef.name == "__raw__"
                ))
                    continue;

                let base = baseRef.getTarget();
                if(base)
                    this.getAllOverridden(arr, base);
            }
        }

        return arr;
    }

    getOverridden(){
        if( this.overridden != undefined )
            return this.overridden;
        this.overridden = null;
        
        let scope = this.scope;
        while(scope && scope.extends){
            let base = scope.extends.getTarget();
            if( !base ) return null;

            this.overridden = base.methods.find(method=>{
                if( method.name != this.name || method.parameters.length != this.parameters.length )
                    return false;
                return !method.parameters.find(
                    (other, i)=>other.type.getTarget() != this.parameters[i].type.getTarget()
                );
            });

            if( !this.overridden ){
                scope = base;
            }else{
                break;
            }
        }

        return this.overridden;
    }

    artificial( retType, name, args, body ){
        this.result = retType;
        this.name = name;
        this.parameters.push( ...args );
        this.body = body;
    }

    resolve( fqcn, trail, test ){
        // console.log("FQCN method: ", fqcn);
        fqcn = [...fqcn];
        let name = fqcn.shift();

        for( let field of this.parameters ){
            if( field.name == name ){
                if( !fqcn.length ){
                    if( !test(field) )
                        continue;
                    trail.push( field );
                    return field;
                }
                
                trail.push( field );
                return field.type.resolve( fqcn, trail, test );
            }
        }
        return null;
    }

}

module.exports = { Method, Constructor };

