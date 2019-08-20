APP.addPlugin("BuildCPP", ["Build"], _=> {
    let buildFolder = "";
    let objFile = {};
    let nextObjFileId = 1;
    let libs = {};
    let objBuffer = null;
    let libFlags = [];
    let libSrc = {};

    APP.add({

        getCPPBuildFolder(){
            return buildFolder;
        },

        clean(){
            libFlags = [];
            libSrc = {};
            libs = {};            
            objFile = {};
        },

        onOpenProject(){
            objBuffer = new Buffer();
            objBuffer.type = "o list";

            this.clean();

            const tmpDir = require("os").tmpdir();
            fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
                buildFolder = folder;
                APP.customSetVariables({buildFolder});
            });
        },

        _addObj(objPath, pending){
            objBuffer.data.push(objPath);
            pending.done();
        },

        _buildProjectFiles( files, pending ){
            files.filter(f=>f.type=="C"
                         || f.type=="CPP"
                         || f.type=="S"
                        )
                .forEach( buffer =>{
                    pending.start();
                    compile(buffer, (err, id)=>{
                        if( err ) pending.error(err);
                        else this._addObj(id, pending);
                    });
                });
        },

        _addLib(path, pending){
            let srcext = ["CPP", "C", "CC", "S"];
            let obj;
            if( typeof path == "object" ){
                obj = path;
                path = path.recurse;
            }
            
            let id = libs[path];
            
            if( id ){
                
                this._addObj(id, pending);
                
            }else if( !obj ){

                libFile.call(this, path, pending);

            }else if( libSrc[path] ){

                let src = libSrc[path];
                src.forEach( path=>{
                    if( libs[path] )
                        this._addObj(libs[path], pending);
                    else
                        libFile.call(this, path, pending);
                });

            }else{

                let ignore;
                if( obj.ignore )
                    ignore = new RegExp(obj.ignore, "gi");
                
                let src = libSrc[path] = [];
                pending.start();

                let p = new Pending(_=>{
                    src.forEach( path=>libFile.call(this, path, pending) );
                    pending.done();
                }, pending.error);

                let realPath = APP.replaceDataInString(path.replace(/\*/g, ""));
                libDir(realPath, src, p, ignore);

            }
            
            function libDir( path, src, pending, ignore ){
                libFlags.push("-I" + path);
                pending.start();
                fs.readdir(path, (error, entries)=>{
                    entries.forEach( entry =>{
                        
                        if( /^\.|~$/.test(entry) ) 
                            return;

                        if( ignore ){
                            ignore.lastIndex = 0;
                            if( ignore.test(entry) )
                                return;
                        }
                        
                        let full = path + "/" + entry;
                        pending.start();
                        
                        fs.stat( full, (err, stat)=>{
                            if(stat.isDirectory() ){
                                libDir( full, src, pending, ignore );
                            } else if(
                                srcext.indexOf(
                                    entry.split(".").pop().toUpperCase()
                                ) != -1
                            ){
                                src.push(full);
                            }
                            
                            pending.done();
                        });
                    });
                    pending.done();
                });
            }

            function libFile( path, pending ){
                pending.start();
                let buffer = {};
                buffer.path = APP.replaceDataInString( path );
                buffer.type = path.split(".").pop().toUpperCase();
                compile(buffer, (err, objPath)=>{
                    if( err ) pending.error(err);
                    else{
                        libs[path] = objPath;
                        this._addObj(objPath, pending);
                    }
                });
            }

        },
        
        ["compile-cpp"]( files, cb ){
            objBuffer.data = [];

            let pendingLibs = new Pending(_=>{

                let pending = new Pending(_=>{
                    files.push(objBuffer);
                    cb();
                }, err => {
                    cb(err);
                });
                
                this._buildProjectFiles( files, pending );
                
            }, err => {
                cb(err);
            });

            if( DATA.project.libs && DATA.project.libs[DATA.project.target] )
                DATA.project.libs[DATA.project.target].forEach( path => {
                    this._addLib(path, pendingLibs);
                });
            
        }
    });

    function compile( buffer, cb ){
        if( !buffer.path || buffer.modified ){
            
            if( !buffer.path )
                buffer.path = buildFolder + path.sep + buffer.name;

            APP.writeBuffer( buffer );
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
            if( typeFlags[DATA.buildMode] )
                flags.push( ...typeFlags[DATA.buildMode] );
        }

        if( buffer.type == "C" || buffer.type == "CPP" )
            flags.push("-D" + DATA.buildMode);
        
        flags.push(...libFlags);

        if( !objFile[ buffer.path ] )
            objFile[ buffer.path ] = nextObjFileId++;

        let id = objFile[ buffer.path ];

        flags.push("-o");
        
        let output = buildFolder + path.sep + objFile[buffer.path] + ".o";
        flags.push( output );

        buffer.error = "";

        APP.spawn( compilerPath, ...flags )
            .on("data-err", err =>{
                buffer.error += err;
            })
            .on("data-out", msg=>{
                APP.log("CPP: " + msg);
            })
            .on("close", error=>{
                if( error ){
                    APP.findFile( buffer.path, true );
                    cb( buffer
                        .error
                        .split("\n")
                        .filter(x=>x.indexOf("rror:") != -1 )
                        .join("\n")
                        .substr(0, 512)
                      );
                }else{
                    if( buffer.error != "" )
                        APP.log("CPP: " + buffer.error);
                    cb( null, output );
                }
            });

    }
});
