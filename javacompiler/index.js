const proc = require("process");
const path = require("path");
const fs = require("fs");
const javaParser = require("java-parser").parse;
const palParser = require("./palParser.js").parsePalette;
const spriteParser = require("./spriteParser.js");
const {Unit, getUnit, nativeTypeList} = require("./Unit.js");
const { parsers, toAST, resolveVFS, vfs } = require("./AST.js");

parsers.bin={
    run( src, name ){
        if( src.data )
            src = src.data;

        let unit = new Unit();
        unit.binary(src, name);
        return unit;
    }
};

parsers.java={
    run( src ){
        let cst = javaParser( src );
        let unit = new Unit();
        unit.process(cst);
        return unit;
    }
};

parsers.pal={
    run( src, name ){
        let colors = palParser( src, name[name.length-1] );
        let unit = new Unit();
        unit.palette(colors, name);
        return unit;
    }
};

parsers.json={

    run( json, name ){
        let sprite = spriteParser( json, name );
        let unit = new Unit();
        unit.image(sprite, name);
        return unit;
    },

    load( fileName, cb ){
        let format, json;
        fs.readFile( fileName, "utf-8", onReadJSON );
        function onReadJSON( err, src ){
            json = JSON.parse(src);

            let imagePath = fileName.replace(/[/\\][^/\\]+$/,"")
                + path.sep
                + json.meta.image;

            format = imagePath.split(".").pop().toLowerCase();

            fs.readFile( imagePath, onReadImage );

        }

        function onReadImage( err, data ){
            if( err )
                throw err; // console.log("Loading image: ", err, data);

            data = data.toString("base64");
            data = `data:image/${format};base64,${data}`;

            const {createCanvas, loadImage} = require('canvas');
            loadImage( data ).then(img => {

                const canvas = createCanvas( img.width, img.height );
                const ctx = canvas.getContext("2d");
                ctx.drawImage( img, 0, 0 );

                let id = ctx.getImageData( 0, 0, img.width, img.height );
                json.meta.image = id;

                cb( null, json );

            }).catch(ex=>{
                cb( ex, null ); // console.error( ex );
            });
        }
    }

};

function loadToVFS( parts, object ){
    // console.log("VFS: ", parts, object.parser);
    let ctx = vfs;
    for( let i=0; i<parts.length-1; ++i ){
        if( !ctx[parts[i]] ){
            ctx[parts[i]] = {};
        }
        ctx = ctx[parts[i]];
    }
    ctx[parts[parts.length-1]] = object;
}

let mainClass = proc.argv[2];
// loadClassToVFS( mainClass );

let dir = mainClass.split(".");
dir.pop();
let pending = 0;
fs.readdirSync( dir.join("/") ).forEach( file => {
    let ext = file.match(/\.([a-z]+)$/i);
    if( !ext )
        return;

    let parser = parsers[ ext[1] ];
    if( !parser )
        return;

    pending++;
    let fileName = dir.join(path.sep) + path.sep + file;
    let src;
    if( parser.load ){
        parser.load( fileName, onLoad );
    }else{
        fs.readFile( fileName, "utf-8", onLoad );
    }
    function onLoad( err, src ){
        if( err ){
            console.error(err);
            return;
        }
        let object = { src, parser:ext[1] };
        loadToVFS( [...dir, file.replace(/\..*$/,"")], object );
        if( !--pending )
            onDoneLoadingVFS();
    }
});

function onDoneLoadingVFS(){

    let fqcn = mainClass.split(".");
    let unit = toAST( fqcn );

    if( unit ){
        let output = require('./cppwriter.js').write(unit, fqcn);
        fs.writeFileSync(
            mainClass.replace(/\./g, path.sep) + ".cpp",
            output,
            "utf-8"
        );
        // console.log(output);
    }
}

