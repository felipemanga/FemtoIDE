Object.assign(encoding, {
    "PNG":null,
    "BIN":null
});

APP.addPlugin("BuildJava", ["Build"], _ => {
    APP.add({
        ["compile-java"]( files, cb ){
            APP.readFilteredBuffers(
                files,
                (f=>f.type=="JAVA"
                 || f.type=="PNG"
                 || f.type=="JSON"
                 || f.type=="PAL"
                 || f.type=="BIN"
                ),
                compileJava.bind(null, cb, files) );
        }
    });

    function compileJava( onDone, buffers, files ){
        global.rootPath = DATA.appPath + "/javacompiler/";
        
        const proc = require("process");
        const path = require("path");
        const fs = require("fs");
        const javaParser = require("java-parser").parse;
        const palParser = require(`${DATA.appPath}/javacompiler/palParser.js`).parsePalette;
        const spriteParser = require(`${DATA.appPath}/javacompiler/spriteParser.js`);
        const {Unit, getUnit, nativeTypeList} = require(`${DATA.appPath}/javacompiler/Unit.js`);
        const { reset, parsers, toAST, resolveVFS, vfs } = require(`${DATA.appPath}/javacompiler/AST.js`);

        reset();
        registerParsers();

        let pending = new Pending(onDoneLoadingVFS);
        
        let mainClass = DATA.project.javaFlags.mainClass;
        
        Object.keys(files).forEach( file => {
            let ext = file.match(/\.([a-z]+)$/i);
            let parser = parsers[ ext[1] ];
            if( !parser )
                return;

            let fqcn = file
                .substr( DATA.projectPath.length + 1 )
                .replace(/\..*$/,"")
                .split(path.sep);

            let src = files[file] + "";
            pending.start();
            if( parser.load ){
                parser.load( {name:file, src}, onLoad );
            }else{
                setTimeout( onLoad.bind(null, null, src), 0 );
            }

            function onLoad( err, src ){
                let object = { name:file, src, parser:ext[1] };
                loadToVFS( fqcn, object );
                pending.done();
            }
        });

        

        function registerParsers(){
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
                run(){
                    let unit = new Unit();
                    return unit;
                },

                postRun( res ){
                    let cst;
                    try{
                        cst = javaParser( res.src );
                    }catch(ex){
                        let name = res.name || "???";
                        if( name.startsWith(DATA.projectPath) ){
                            name = name.substr(DATA.projectPath.length+1);
                        }
                        throw( name + ": " + ex.message );
                    }
                    res.unit.process(cst);
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

                load( file, cb ){
                    let format;
                    let json = JSON.parse( file.src + "" );

                    if( !json || !json.meta || !json.meta.image ){
                        cb( null, json );
                        return;
                    }
                    
                    let imagePath = file.name.replace(/[/\\][^/\\]+$/,"")
                        + path.sep
                        + json.meta.image;

                    format = imagePath.split(".").pop().toLowerCase();

                    let buffer = DATA.projectFiles
                        .find( buffer => buffer.path == imagePath );

                    if( !buffer ){
                        cb("Could not open image: " + imagePath, null);
                        return;
                    }

                    data = buffer.data.toString("base64");
                    data = `data:image/${format};base64,${data}`;

                    let img = new Image();
                    img.onload = onLoadImage.bind(null, img);
                    img.src = data;

                    function onLoadImage( img ){

                            const canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;

                            const ctx = canvas.getContext("2d");
                            ctx.drawImage( img, 0, 0 );

                            let id = ctx.getImageData( 0, 0, img.width, img.height );
                            json.meta.image = id;

                            cb( null, json );

                    }
                }

            };

        }

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

        function onDoneLoadingVFS(){

            // global.console = console;

            let fqcn = mainClass.split(".");
            let unit = toAST( fqcn );

            if( unit ){
                let output = require(`${DATA.appPath}/javacompiler/cppwriter.js`).write(unit, fqcn, DATA.project.target);
                
                let buffer = DATA.debugBuffer;
                if( !DATA.debugBuffer ){
                    buffer = new Buffer();
                    APP.customSetVariables({debugBuffer:buffer});
                }
                
                buffer.data = output;
                buffer.name = "generated.cpp";
                buffer.type = "CPP";
                buffers.push(buffer);
                onDone();
            }
        }

        
    }

});
