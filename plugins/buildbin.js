APP.addPlugin("BuildBIN", ["Build"], _=> {
    let buffer;

    function replaceData( f ){
        return f.replace(/\$\{([^}]+)\}/g, (s, key)=>DATA[key]);
    }

    APP.add({
        onOpenProject(){
            buffer = new Buffer();
            buffer.type = "BIN";
        },

        ["compile-bin"]( files, cb ){
            let olist = files.find( f=>f.type=="ELF" );
            if( !olist ){
                cb("Could not find ELF");
                return;
            }

            let execPath = DATA[
                "ELF2BIN-" + DATA.project.target
            ] + DATA.executableExt;

            let flags = [];

            let typeFlags = DATA.project["ELF2BINFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
            }

            APP.spawn( execPath, flags )
                .on("data-err", err=>{
                    APP.error("BIN: " + err);
                })
                .on("close", error=>{
                    if( error ){
                        cb( true );
                    }else{
                        buffer.path = flags[flags.length-1];
                        files.push( buffer );
                        calculateChecksum( buffer.path );
                    }
                });
            
            function calculateChecksum( path ){
                path = APP.replaceDataInString(path);
                
                fs.readFile( path, (err, buffer)=>{
                    if( err )
                        return cb( err );
                    
                    let acc = 0;
                    let u32 = new Uint32Array(buffer.buffer);
                    for( let i=0; i<4; ++i )
                        acc -= u32[i];
                    u32[7] = acc;
                    
                    fs.writeFile( path, buffer, err=>{
                        if( err )
                            return cb( err );
                        return cb(null);
                    });
                    
                    return undefined;
                });
            }
        }
    });
});
