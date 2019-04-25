APP.addPlugin("BuildLD", ["Build"], _=> {
    const { execFile, execSync } = require('child_process');

    let buffer;

    APP.add({
        onOpenProject(){
            buffer = new Buffer();
            buffer.type = "ELF";
        },

        ["compile-ld"]( files, cb ){
            let olist = files.find( f=>f.type=="o list" );
            if( !olist ){
                cb("Could not find O list");
                return;
            }

            let linkerPath = DATA[
                "LD-" + DATA.project.target
            ] + DATA.executableExt;

            let flags = [];

            let typeFlags = DATA.project["LDFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
                if( typeFlags[DATA.buildMode] )
                    flags.push( ...typeFlags[DATA.buildMode] );
            }

            flags = APP.replaceDataInString(flags);

            let i = flags.indexOf("$objectFiles");
            if( i > -1 )
                flags.splice( i, 1, ...olist.data);

            console.log( linkerPath, ...flags );

            execFile( linkerPath, flags, (error, stdout, stderr)=>{
                if( error ){
                    cb( stderr );
                }else{
                    let i = flags.indexOf("--output");
                    buffer.path = flags[i+1];
                    files.push( buffer );
                    cb( null );
                }
            });
            
        }
    });
});
