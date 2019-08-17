const {Type} = require("./Type.js");
const {TypeRef} = require("./TypeRef.js");
const {Method, Constructor} = require("./Method.js");
const {Field} = require("./Field.js");
const {ast} = require("./AST.js");
const getLocation = require("./getLocation.js");

function getDecl( node ){
    if( !node.children || node.children.normalClassDeclaration )
        return "normalClassDeclaration";
    if( node.children.normalInterfaceDeclaration )
        return "normalInterfaceDeclaration";
    if( node.children.annotationTypeDeclaration )
        return "annotationTypeDeclaration";
    return null;
}

class Clazz extends Type {
    constructor( node, parent ){
        super(
            node,
            getDecl(node),
            "class",
            parent
        );

        this.resourceFactories = null;
        this.initializers = [];
        this.fields = [];
        this.methods = [];
        this.types = [];
        this.extends = null;
        this.implements = [];
        this.isAnnotation = false;
        this.isInterface = false;
        this.isClass = true;
        this.isInline = false;
        this.hasConstructor = false;
        this.needsConstructor = false;

        if( typeof node == "string" )
            return;

        if( node.children.normalClassDeclaration ){
            this.initClass( node );
        }else if( node.children.classBody ){
            this.initAnonClass( node );
        }else if( node.children.normalInterfaceDeclaration ){
            this.initInterface( node );
        }else if( node.children.annotationTypeDeclaration ){
            this.initAnnotation( node );
        }else{
            console.log(Object.keys(node.children));
            ast(node);
        }

        if( this.initializers.length ){
            const {Block} = require("./Block.js");
            const {Statement} = require("./Statement.js");
            
            let init = new Method(null, this);
            init.isStatic = true;
            init.isPublic = true;
            init.name = "__class_initializer__";
            init.body = new Block(null, init);
            init.result = new TypeRef(["void"], false, this);

            let scope = this.scope;
            while( scope.scope )
                scope = scope.scope;
            let unit = scope.file;

            this.initializers.forEach( n => {
                let stmt = new Statement(null, init.body);
                stmt.type = "block";
                stmt.block = n;
                stmt.location = {
                    unit,
                    startLine:0,
                    startColumn:0
                };
                init.body.statements.push( stmt );
            });
            this.methods.push(init);
        }
        
    }

    isOfType( other ){
        if( other.getTarget )
            other = other.getTarget();

        if( this == other )
            return true;

        if( this.isNative || other.isNative )
            return false;

        if( this.extends && this.extends.name[0] != "__raw__" && this.extends.getTarget().isOfType(other) )
            return true;

        return this.implements.find( clazzref => clazzref.name[0] != "__stub__" && clazzref.getTarget().isOfType(other) );
    }

    initClass( node ){

        if( node.children.normalClassDeclaration[0].children.superclass ){
            this.extends = new TypeRef(
                node
                    .children
                    .normalClassDeclaration[0]
                    .children
                    .superclass[0]
                    .children
                    .classType[0]
                    .children
                    .Identifier.map( i => i.image ),
                false,
                this.scope
            );

            getLocation( this.extends,
                         node
                         .children
                         .normalClassDeclaration[0]
                       );
        }

        if( node.children.normalClassDeclaration[0].children.superinterfaces )
            node
            .children
            .normalClassDeclaration[0]
            .children
            .superinterfaces[0]
            .children
            .interfaceTypeList[0]
            .children
            .interfaceType
            .forEach( intType => {
                let node = Object
                    .values(intType.children)[0][0];

                let ref = new TypeRef(
                    node
                        .children
                        .Identifier.map( i => i.image ),
                    false,
                    this.scope
                );
                
                getLocation( ref, node );

                this.implements.push( ref );
            });
        
        
        this.initMembers( node.children
                          .normalClassDeclaration[0].children
                          .classBody[0].children
                          .classBodyDeclaration );

        if( !this.hasConstructor && this.needsConstructor ){
            this.methods.push( new Constructor(this.name, this) );
        }
        
    }

    initAnnotation( node ){
        this.isAnnotation = true;
    }

    initInterface( node ){
        this.isInterface = true;
        node.children
            .normalInterfaceDeclaration[0].children
            .interfaceBody[0].children
            .interfaceMemberDeclaration
            .forEach( n => {

                let decl = Object.values(
                    n.children
                )[0][0];

                if( !this[decl.name] ){
                    console.error( decl );
                    ast(decl);
                }
                
                this[ decl.name ]( decl );

            });      
    }

    initAnonClass( node ){

        this.isInline = true;

        this.extends = new TypeRef(
            node.children.classOrInterfaceTypeToInstantiate[0]
                .children.Identifier.map( i=>i.image ),
            false,
            this.scope
        );

        this.initMembers( node.children
                          .classBody[0].children
                          .classBodyDeclaration );            
        
    }

    initMembers( memberNodes ){
        if( !memberNodes )
            return;
        
        memberNodes.forEach( n => {

            let decl;
            if( n.children.constructorDeclaration ){
                decl = n.children.constructorDeclaration[0];
            }else{
                decl = Object.values(
                    Object.values(
                        n.children
                    )[0][0].children
                )[0][0];
            }

            if( !decl || decl.image ){
                decl = Object.values(
                    n.children
                )[0][0];
            }

            if( !this[decl.name] ){
                ast(n);
            }
            
            this[ decl.name ]( decl );

        });
    }

    resolve( fqcn, trail, test ){
        if( typeof test != "function" ){
            throw new Error(`Type of test is ${typeof test}: ${test?test.constructor.name:test}`);
        }

        // console.log("FQCN clazz: ", fqcn);
        if( !fqcn.length )
            return this;

        let fqcnbackup = fqcn;

        fqcn = [...fqcn];
        let name = fqcn.shift();
        if( name == "this" ){
            trail.push( this );
            return this.resolve(fqcn, trail, test);
        }

        if( name == "super" ){
            let superClass = this.extends.getTarget();
            trail.push( superClass );
            return superClass.resolve(fqcn, trail, test);
        }

        for( let type of this.types ){
            if( type.name == name ){
                trail.push( type );
                if( !fqcn.length && test(type) )
                    return type;
                return type.resolve( fqcn, trail, test );
            }
        }

        for( let field of this.fields ){
            if( field.name == name ){
                trail.push( field );
                if( !fqcn.length && test(field) )
                    return field;
                return field.type.resolve( fqcn, trail, test );
            }
        }

        if( fqcn.length == 0 ){
            for( let method of this.methods ){
                if( method.name == name && !method.isConstructor && test(method) ){
                    trail.push(method);
                    return method;
                }
            }
        }

        if( this.extends && this.extends.name[0] != "__raw__" ){
            // console.log( this.extends.name );
            return this.extends.getTarget().resolve( fqcnbackup, trail, test );
        }

        return null;
    }    

    classDeclaration( node ){
        this.types.push( new Clazz(node, this) );
    }

    constantDeclaration( node ){
        let modifierNodes = node.children.fieldModifier || [];
        let typeNode = Object.values(node.children.unannType[0].children)[0];
        let varDeclNodes = node.children
            .variableDeclaratorList[0].children
            .variableDeclarator;
        
        varDeclNodes.forEach( node => {
            let field = new Field(
                modifierNodes,
                typeNode,
                node.children
                    .variableDeclaratorId[0]
                    .children
                    .Identifier[0]
                    .image,
                node.children
                    .variableDeclaratorId[0]
                    .children
                    .dims,
                node,
                this
            );

            getLocation(
                field,
                node.children
                    .variableDeclaratorId[0]
            );
            
            field.isStatic = true;
            
            this.fields.push( field );
        });
    }
    
    fieldDeclaration( node ){
        let modifierNodes = node.children.fieldModifier || [];
        let typeNode = Object.values(node.children.unannType[0].children)[0];
        let varDeclNodes = node.children
            .variableDeclaratorList[0].children
            .variableDeclarator;
        varDeclNodes.forEach( node => {
            let field = new Field(
                modifierNodes,
                typeNode,
                node.children
                    .variableDeclaratorId[0]
                    .children
                    .Identifier[0]
                    .image,
                node.children
                    .variableDeclaratorId[0]
                    .children
                    .dims,
                node,
                this
            );
            

            getLocation(
                field,
                node.children
                    .variableDeclaratorId[0]
            );

            this.fields.push( field );
            if( !field.isStatic && field.init && field.init.expression ){
                this.needsConstructor = true;
            }
        });
    }

    interfaceMethodDeclaration( node ){
        this.methods.push( new Method(node, this) );        
    }

    methodDeclaration( node ){
        this.methods.push( new Method(node, this) );
    }

    constructorDeclaration( node ){
        this.hasConstructor = true;
        this.methods.push( new Constructor(node, this) );
    }

    staticInitializer( node ){
        const {Block} = require("./Block.js");
        this.initializers.push( new Block(node.children.block[0].children.blockStatements[0], this) );
    }

    resource( path ){
        if( !this.resourceFactories ){
            this.resourceFactories = {};
        }

        let fqcn = path.split(/[\/.]/);
        let ext = fqcn[fqcn.length-1].toLowerCase();
        let call = this.scope.resolve(fqcn, [], null, null);
        if( !call )
            throw new Error("Could not resolve '" + path + "'");
        
        let method = this.resourceFactories[ext];
        if( !method ){
            method = new Method(null, this);
            this.methods.push(method);
            method.isPublic = true;
            method.isStatic = true;
            method.artificial(
                call.result,
                ext,
                [
                    new Field(
                        null,
                        ["String"],
                        "path",
                        false,
                        null,
                        method
                    )
                ],
                {resourceLookup:[]}
            );
            this.resourceFactories[ext] = method;
        }
        method.body.resourceLookup.push({ path, call });
    }

    staticImage( image, name, interfaces ){
        this.extends = new TypeRef(["femto", "Image"], false, this.scope);

        if( interfaces ){
            this.implements.push( ... interfaces.map( name => new TypeRef(
                name.split("."),
                false,
                this.scope
            )));
        }

        let method = new Method(null, this);
        this.methods.push( method );
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["pointer"], false, this),
            "getImageDataForScreen",
            [
                new Field(
                    null,
                    // TODO: replace with 16-color interface
                    ["femto", "mode", "HiRes16Color"],
                    "screen",
                    false,
                    null,
                    method
                )
            ],
            {image}
        );

        if( image.isTransparent ){
            method = new Method(null, this);
            this.methods.push(method);
            method.isPublic = true;
            method.isStatic = false;
            method.artificial(
                new TypeRef(["boolean"], false, this),
                "isTransparent",
                [],
                {returnConst:true}
            );
        }
        
        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "height",
            [],
            {returnConst:image.height}
        );

        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "width",
            [],
            {returnConst:image.width}
        );
        
    }

    image( sprite, interfaces ){
        this.extends = new TypeRef(["femto", "Sprite"], false, this.scope);

        if( interfaces ){
            this.implements.push( ... interfaces.map( name => new TypeRef(
                name.split("."),
                false,
                this.scope
            )));
        }

        let method = new Method(null, this);
        this.methods.push( method );
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["pointer"], false, this),
            "getFrameDataForScreen",
            [
                new Field(
                    null,
                    ["uint"],
                    "frameNumber",
                    false,
                    null,
                    method
                ),
                new Field(
                    null,
                    // TODO: replace with 16-color interface
                    ["femto", "mode", "HiRes16Color"],
                    "screen",
                    false,
                    null,
                    method
                )
            ],
            {sprite}
        );

        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "height",
            [],
            {returnConst:sprite.frames ? sprite.frames[0].height : -1}
        );

        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "width",
            [],
            {returnConst:sprite.frames ? sprite.frames[0].width : -1}
        );

        for( let name in sprite.animations ){
            if( !/[a-z_][a-zA-Z0-9_]*/ )
                continue;

            let method = new Method(null, this);
            this.methods.push( method );
            method.isPublic = true;
            method.isStatic = false;
            method.artificial(
                new TypeRef(["void"], false, this),
                name,
                [],
                {animation:name, sprite}
            );            
        }
        
    }

    text( data, extension ){
        let method = new Method(null, this);
        this.methods.push( method );
        method.isPublic = true;
        method.isStatic = true;
        method.artificial(
            new TypeRef(["String"], false, this),
            extension,
            [],
            {textData:data}
        );
    }

    xml( data, extension ){
        let method = new Method(null, this);
        this.methods.push( method );
        method.isPublic = true;
        method.isStatic = true;
        method.artificial(
            new TypeRef(["femto", "XMLNode"], false, this),
            extension,
            [],
            {xmlData:data}
        );
    }

    binary( data, extension ){
        this.addArtificial(
            "pointer",
            extension,
            [],
            {rawData:data}
        ).isStatic = true;
    }

    addArtificial( retType, name, args, innards ){

        if( typeof retType == "string" )
            retType = this.getTypeRef(retType);
        
        let method = new Method(null, this);

        this.methods.push( method );
        method.isPublic = true;
        method.artificial(
            retType,
            name,
            args.map(arg=>this.getTypeRef(arg)),
            innards
        );

        return method;
    }

    addForwardingConstructors(){
        const {Expression} = require("./Expression.js");
        const {Ref} = require("./Ref.js");

        const base = this.extends.getTarget();
        base.methods
            .filter(m=>m.isConstructor)
            .forEach(c=>{
                let nc = new Constructor(this.name, this);
                c.parameters.forEach(p =>{
                    nc.parameters.push(p);
                    nc.superArgs.push(new Ref([p.name], nc));
                });

                this.methods.push(nc);
                this.hasConstructor = true;
            });
    }

    getTypeRef( name, useParentScope ){
        if( typeof name == "object" )
            return name;
        
        let isArray = false;
        name = name.trim();
        if( name.endsWith("[]") ){
            isArray = true;
            name = name.substr(0, name.length-2);
        }

        return new TypeRef(name.split("."), isArray, useParentScope ? this.scope : this);
    }
}

module.exports = Clazz;
