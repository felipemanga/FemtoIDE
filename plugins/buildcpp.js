APP.addPlugin("BuildCPP", ["Build"], _=> {
    const { execFile, execSync } = require('child_process');
    let buildFolder = "";
    let objFile = {};
    let nextObjFileId = 1;
    let libs = {};
    let objBuffer = null;

    function replaceData( f ){
        return f.replace(/\$\{([^}]+)\}/g, (s, key)=>DATA[key]);
    }
    
    APP.add({

        getCPPBuildFolder(){
            return buildFolder;
        },

        onOpenProject(){
            objBuffer = new Buffer();
            objBuffer.type = "o list";
            objFile = {};
            const tmpDir = require("os").tmpdir();
            fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
                buildFolder = folder;
                APP.customSetVariables({buildFolder});
            });
        },
        
        ["compile-cpp"]( files, cb ){
            objBuffer.data = [];
            let pending = new Pending(_=>{
                files.push(objBuffer);
                cb();
            }, err => {
                APP.error(err);
            });

            files.filter(f=>f.type=="C"
                         || f.type=="CPP"
                         || f.type=="S"
                        )
                .forEach( buffer =>{
                    pending.start();
                    compile(buffer, (err, id)=>{
                        if( err ) pending.error(err);
                        else addObj(id);
                    });
                });

            if( DATA.project.libs && DATA.project.libs[DATA.project.target] )
                DATA.project.libs[DATA.project.target].forEach( path => {
                    let id = libs[path];
                    pending.start();
                    if( !id ){
                        let buffer = new Buffer();
                        buffer.path = path;
                        buffer.type = path.split(".").pop().toUpperCase();
                        compile(buffer, (err, objPath)=>{
                            if( err ) pending.error(err);
                            else{
                                libs[path] = objPath;
                                addObj(objPath);
                            }
                        });
                    }else{
                        addObj(id);
                    }
                });

            function addObj( objPath ){
                objBuffer.data.push(objPath);
                pending.done();
            }
            
        }
    });

    function compile( buffer, cb ){
        if( !buffer.path ){
            buffer.path = buildFolder + path.sep + buffer.name;
            fs.writeFile( buffer.path, buffer.data, "utf-8", (err)=>{
                if( err ){
                    cb("Could not save file: " + buffer.data);
                    return;
                }
                compile( buffer, cb );
            });
            return;
        }

        let compilerPath = DATA[
            buffer.type + "-" + DATA.project.target
        ] + DATA.executableExt;

        let flags = [buffer.path];

        let typeFlags = DATA.project[buffer.type+"Flags"];
        if( typeFlags ){
            if( typeFlags[DATA.project.target] )
                flags.push(...typeFlags[DATA.project.target]);
            if( typeFlags.ALL )
                flags.push( ...typeFlags.ALL );
        }

        if( !objFile[ buffer.path ] )
            objFile[ buffer.path ] = nextObjFileId++;

        let id = objFile[ buffer.path ];

        flags.push("-o");
        
        let output = buildFolder + path.sep + objFile[buffer.path] + ".o";
        flags.push( output );

        flags = flags.map( f => replaceData(f) );

        let full = `"${compilerPath}" `;
        full += flags.map( f => `"${f}"`).join(" ");

        console.log(full);

        execFile( compilerPath, flags, (error, stdout, stderr)=>{
            if( error ){
                APP.displayBuffer( buffer );
                cb( stderr );
            }else cb( null, output );
        });

    }
});
