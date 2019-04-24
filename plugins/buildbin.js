APP.addPlugin("BuildBIN", ["Build"], _=> {
    const { execFile, execSync } = require('child_process');

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

            flags = flags.map( f => replaceData(f) );

            console.log( execPath, ...flags );

            execFile( execPath, flags, (error, stdout, stderr)=>{
                if( error ){
                    cb( stderr );
                }else{
                    buffer.path = flags[flags.length-1];
                    files.push( buffer );
                    cb( null );
                }
            });
            
        }
    });
});
