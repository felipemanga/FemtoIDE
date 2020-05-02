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
            ];

            if(!linkerPath)
                linkerPath = "g++";

            linkerPath += DATA.executableExt;

            let flags = APP.getFlags("LD");
            let i = flags.indexOf("$objectFiles");
            if( i > -1 ){
                flags.splice( i, 1, ...olist.data.map(p=>{
                    if( p.startsWith(cwd) )
                        return p.substr(cwd.length+1);
                    return p;
                }));
            }

            let error = [];

	    const folder = linkerPath.split(/[\\\/]/).slice(0, -1).join(path.sep);
	    const PATH = folder + ";" + process.env.PATH;
	    const env = Object.assign({}, process.env, {PATH, Path:PATH});

            APP.spawn( linkerPath, {cwd, env}, ...flags )
                .on("data-err", err=>{
                    error.push(["error", err]);
                })
                .on("data-out", msg=>{
                    error.push(["log", msg]);
                })
                .on("close", errorNum=>{
                    if( errorNum ){
                        cb( error );
                    }else{
                        APP.logDump(error, "log");
                        let i = flags.indexOf("--output");
                        buffer.path = flags[i+1];
                        files.push( buffer );
                        cb( null );
                    }
                });
            
        }
    });
});
