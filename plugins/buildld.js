APP.addPlugin("BuildLD", ["Build"], _=> {
    let buffer;

    APP.add({
        onOpenProject(){
            buffer = new Buffer();
            buffer.type = "ELF";
        },

        ["compile-ld"]( files, cb ){
            let cwd;
            let olist = files.find( f=>f.type=="o list" );
            if( !olist ){
                cb("Could not find O list");
                return;
            }

            cwd = DATA.buildFolder;

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

            let i = flags.indexOf("$objectFiles");
            if( i > -1 ){
                flags.splice( i, 1, ...olist.data.map(p=>{
                    if( p.startsWith(cwd) )
                        return p.substr(cwd.length+1);
                    return p;
                }));
            }

            APP.spawn( linkerPath, {cwd}, ...flags )
                .on("data-err", err=>{
                    APP.error("LD: " + err);                    
                })
                .on("close", error=>{
                    if( error ){
                        cb( true );
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
