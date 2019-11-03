const {Type} = require("./Type.js");
const {TypeRef} = require("./TypeRef.js");
const {Method} = require("./Method.js");
const {Field} = require("./Field.js");
const {Unit} = require(`./Unit.js`);

module.exports.Data = {

    unit(name, type, ...args){
        const unit = new Unit();
        const clazz = unit.clazz(name);
        if(!type) return clazz;
        this[type].apply(clazz, args);
        return unit;
    },

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
    },

    sound(src){
        this.extends = this.getTypeRef("femto.sound.Procedural", true);

        this.addForwardingConstructors();

        this.addArtificial("ubyte", "update", [], {
            stream:src,
            index:"t",
            endOfData:128
        });
    },

    staticImage( image, meta ){
        this.extends = new TypeRef(["femto", "Image"], false, this.scope);
        
        if( meta.interfaces ){
            this.implements.push( ... meta
                                  .interfaces
                                  .map( name => new TypeRef(
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
            Object.assign({}, meta, {image, bits:4})
        );

        method = new Method(null, this);
        this.methods.push( method );
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["pointer"], false, this),
            "getImageDataForScreen",
            [
                new Field(
                    null,
                    // TODO: replace with 256-color interface
                    ["femto", "mode", "LowRes256Color"],
                    "screen",
                    false,
                    null,
                    method
                )
            ],
            Object.assign({}, meta, {image, bits:8})
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
        
    },

    tilemap( tilemap, interfaces ){
        this.extends = new TypeRef(["femto", "TileSet"], false, this.scope);

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
            {tilemap}
        );

        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "tileCount",
            [],
            {returnConst:tilemap.tiles.length}
        );
        
        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "height",
            [],
            {returnConst:tilemap.height}
        );

        method = new Method(null, this);
        this.methods.push(method);
        method.isPublic = true;
        method.isStatic = false;
        method.artificial(
            new TypeRef(["int"], false, this),
            "width",
            [],
            {returnConst:tilemap.width}
        );        
    },

    sprite( sprite, interfaces ){
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
            {sprite, bits:4}
        );

        method = new Method(null, this);
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
                    // TODO: replace with 256-color interface
                    ["femto", "mode", "LowRes256Color"],
                    "screen",
                    false,
                    null,
                    method
                )
            ],
            {sprite, bits:8}
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
        
    },

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
    },

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
    },

    binary( data, extension ){
        this.addArtificial(
            "pointer",
            extension,
            [],
            {rawData:data}
        ).isStatic = true;
    }
    
};
