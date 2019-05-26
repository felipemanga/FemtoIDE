Object.assign(encoding, {
    "PNG":null,
    "BIN":null
});

APP.addPlugin("BuildJava", ["Build"], _ => {
    let jcmap = {};
    let cjmap = [];
    const mapexpr = /\n(?:\/\*<MAP\*([^|]*)\|([0-9]+)\|([0-9]+)\*MAP>\*\/)?/g;
    
    APP.add({

        displayGeneratedCPP(){
            let gen = DATA.debugBuffer;
            if( !gen ){
                console.error("No generated CPP buffer found");
                return;
            }
            
            APP.displayBuffer( gen );
        },

        getBreakpointLocation( buffer, row, poll ){
            let file = buffer.path+"";
            let m = jcmap[ file ];
            if( !m )
                return;

            while( row && m[row]===undefined )
                row--;

            if( m[row] === undefined )
                return;

            if( !poll[0] || poll[0].priority < 0 ){
                poll[0] = {
                    priority:100,
                    file:"generated.cpp",
                    line:m[row]
                };
            }
            
        },

        sourceMap( file, line ){
            if( !file.endsWith("generated.cpp") )
                return undefined;
            
            while( line>0 && !cjmap[line] )
                line--;

            return cjmap[line];
        },

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

        let jsons = {};

        Object.keys(files).forEach( file => {
            if( /\.json$/i.test(file) ){
                jsons[file.toUpperCase()] = true;
            }
        });
        
        Object.keys(files).forEach( file => {
            let ext = file.match(/\.([a-z]+)$/i);
            if( !ext )
                return;
            let parserExt = ext[1];
            let parser = parsers[ ext[1] ];
            if( !parser ){
                parser = parsers.bin;
                parserExt = "bin";
            }

            if( ext[1].toUpperCase() == "PNG" ){
                if( jsons[file.toUpperCase().replace(/\.png$/i,".JSON")] )
                    return;
            }

            let fqcn = file
                .substr( DATA.projectPath.length + 1 )
                .replace(/\..*$/,"")
                .split(path.sep);

            let src = files[file];
            pending.start();
            if( parser.load ){
                parser.load( {name:file, type:ext[1], src}, onLoad );
            }else{
                setTimeout( onLoad.bind(null, null, src), 0 );
            }

            function onLoad( err, src ){
                let object = { name:file, src, type:ext[1], parser:parserExt };
                loadToVFS( fqcn, object );
                pending.done();
            }
        });

        

        function registerParsers(){
            parsers.bin={
                run( src, name, type ){
                    if( src.data )
                        src = src.data;

                    let unit = new Unit();
                    unit.binary(src, name, type);
                    return unit;
                }
            };

            parsers.java={
                run(){
                    let unit = new Unit();
                    return unit;
                },

                postRun( res ){
                    res.unit.file = res.name || "???";
                    let cst;
                    try{
                        cst = javaParser( res.src );
                    }catch(ex){
                        let name = res.name || (res.unit && res.unit.name + "") || "???";
                        if( name.startsWith(DATA.projectPath) ){
                            name = name.substr(DATA.projectPath.length+1);
                        }
                        
                        throw( name + ": " + (ex.message || ex) );
                    }
                    res.unit.process(cst);
                }
            };

            parsers.pal={
                run( src, name ){
                    let colors = palParser( src, name[name.length-1] );
                    let unit = new Unit();
                    let arr16 = new Uint16Array( colors.colors16 );
                    let arr8 = new Uint8Array(arr16.buffer);
                    let arr = [
                        colors.colors16.length,
                        0,
                        ...arr8
                    ];
                    unit.binary( arr, name, "palette");
                    return unit;
                }
            };

            parsers.png={
                run( png, name ){
                    let unit = new Unit();
                    unit.staticImage(png, name);
                    return unit;
                },

                load( file, cb ){
                    let data = file.src.toString("base64");
                    data = `data:image/png;base64,${data}`;

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
                        let isTransparent = false;
                        for( let i=0; i<id.data.length; i+=4 ){
                            if( id.data[i+3] < 128 ){
                                isTransparent = true;
                                break;
                            }
                        }
                        
                        cb( null, {
                            isTransparent,
                            width:id.width,
                            height:id.height,
                            data:id.data
                        });

                    }
                    
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

                    let data = buffer.data.toString("base64");
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
            try {
                
                // global.console = console;

                let fqcn = mainClass.split(".");
                let unit = toAST( fqcn );

                if( unit ){
                    let output = require(`${DATA.appPath}/javacompiler/cppwriter.js`).write(unit, fqcn, DATA.project.target, DATA.buildMode == "DEBUG");
                    
                    let buffer = DATA.debugBuffer;
                    if( !DATA.debugBuffer ){
                        buffer = new Buffer();
                        APP.customSetVariables({debugBuffer:buffer});
                    }

                    output = makeSourceMap(output);

                    buffer.modified = true;
                    buffer.data = output;
                    buffer.name = "generated.cpp";
                    buffer.type = "CPP";
                    buffer.transform = null;
                    buffers.push(buffer);
                    onDone();
                }
            }catch( ex ){
                onDone(ex);
            }
        }

        function makeSourceMap( output ){
            cjmap = [];
            jcmap = {};
            
            let cppline = 1;
            let lineOffset = 0,
                columnOffset = 0;
            return output.replace(mapexpr, (match, file, line, column)=>{
                if( !line ){
                    cppline++;
                    return match;
                }

                line = line|0;
                column = column|0;
                file = DATA.projectPath
                    + "/"
                    + file.replace(/\./g, "/")
                    + ".java";
                file = file.replace(/\//g, path.sep);
                let arr = jcmap[file];
                if( !arr ) jcmap[file] = arr = [];
                arr[line-1] = cppline;

                cjmap[cppline] = {file, line};
                return "";
            });
        }
        
    }

});
