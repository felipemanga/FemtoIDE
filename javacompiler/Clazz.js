const {Type} = require("./Type.js");
const {TypeRef} = require("./TypeRef.js");
const {Method, Constructor} = require("./Method.js");
const {Field} = require("./Field.js");
const {ast} = require("./AST.js");

class Clazz extends Type {
    constructor( node, parent ){
        super(
            node,
            (!node.children || node.children.normalClassDeclaration ?
             "normalClassDeclaration" :
             (node.children.normalInterfaceDeclaration ? "normalInterfaceDeclaration" : null)
            ),
            "class",
            parent
        );
        
        this.fields = [];
        this.methods = [];
        this.types = [];
        this.extends = null;
        this.implements = [];
        this.isInterface = false;
        this.isClass = true;
        this.isInline = false;

        if( typeof node == "string" )
            return;

        if( node.children.normalClassDeclaration ){
            this.initClass( node );
        }else if( node.children.classBody ){
            this.initAnonClass( node );
        }else if( node.children.normalInterfaceDeclaration ){
            this.initInterface( node );
        }

    }

    initClass( node ){

        if( node.children.normalClassDeclaration[0].children.superclass )
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
                this.implements.push( new TypeRef(
                    Object
                        .values(intType.children)[0][0]
                        .children
                        .Identifier.map( i => i.image ),
                    false,
                    this.scope
                ));
            });
        
        
        this.initMembers( node.children
                          .normalClassDeclaration[0].children
                          .classBody[0].children
                          .classBodyDeclaration );
        
    }

    initInterface( node ){
        this.isInterface = true;
        node.children
            .normalInterfaceDeclaration[0].children
            .interfaceBody[0].children
            .interfaceMemberDeclaration
            .forEach( n => {

                let decl =Object.values(
                    n.children
                )[0][0];

                if( !this[decl.name] ){
                    console.error( decl );
                    ast(decl);
                    throw "ERROR: unknown interface member node";
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

            let decl = n.children.constructorDeclaration
                ?
                n.children.constructorDeclaration[0]
                : Object.values(
                    Object.values(
                        n.children
                    )[0][0].children
                )[0][0];

            if( !this[decl.name] ){
                console.error( decl );
                ast(decl);
                throw "ERROR: unknown member node";
            }
            this[ decl.name ]( decl );

        });
    }

    resolve( fqcn, trail ){
        // console.log("FQCN clazz: ", fqcn);
        if( !fqcn.length )
            return this;

        let fqcnbackup = fqcn;

        fqcn = [...fqcn];
        let name = fqcn.shift();
        if( name == "this" ){
            trail.push( this );
            return this.resolve(fqcn, trail);
        }

        if( name == "super" ){
            let superClass = this.extends.getTarget();
            trail.push( superClass );
            return superClass.resolve(fqcn, trail);
        }

        for( let type of this.types ){
            if( type.name == name ){
                trail.push( type );
                if( !fqcn.length )
                    return type;
                return type.resolve( fqcn, trail );
            }
        }

        for( let field of this.fields ){
            if( field.name == name ){
                trail.push( field );
                if( !fqcn.length )
                    return field;
                return field.type.resolve( fqcn, trail );
            }
        }

        if( fqcn.length == 0 ){
            for( let method of this.methods ){
                if( method.name == name && !method.isConstructor ){
                    trail.push(method);
                    return method;
                }
            }
        }

        if( this.extends && this.extends.name[0] != "__raw__" ){
            // console.log( this.extends.name );
            return this.extends.getTarget().resolve( fqcnbackup, trail );
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
            this.fields.push( new Field(
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
            ) );
        });
    }

    interfaceMethodDeclaration( node ){
        this.methods.push( new Method(node, this) );        
    }

    methodDeclaration( node ){
        this.methods.push( new Method(node, this) );
    }

    constructorDeclaration( node ){
        this.methods.push( new Constructor(node, this) );
    }

    staticImage( image, name ){
        this.extends = new TypeRef(["femto", "Image"], false, this.scope);

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

    image( sprite ){
        this.extends = new TypeRef(["femto", "Sprite"], false, this.scope);

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

    binary( data, extension ){
        let method = new Method(null, this);
        this.methods.push( method );
        method.isPublic = true;
        method.isStatic = true;
        method.artificial(
            new TypeRef(["pointer"], false, this),
            extension,
            [],
            {rawData:data}
        );
    }
}

module.exports = Clazz;
