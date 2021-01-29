APP.addPlugin("BuildCPP", ["Build"], _=> {
    let failLine;
    let isCleanBuild = false;
    let buildFolder = "";
    let objFile = {};
    let nextObjFileId = 1;
    let libs = {};
    let objBuffer = null;
    let libFlags = [];
    let libSrc = {};
    let cdb = [];
    let cdbCompilerPath = "clang", cdbIncludes = [];
    let jobs = [];
    let workerCount = 0;

    function hash(str){
        let v = 5381;
        for(let i=0; i<str.length; ++i){
            v = ((v*31 >>> 0) + str.charCodeAt(i)) >>> 0;
        }
        return v;
    }

    function validLibEntry(entry, ignore){
        if( /^\.|~$/.test(entry) ) 
            return false;

        if( ignore ){
            ignore.lastIndex = 0;
            if( ignore.test(entry) )
                return false;
        }
        
        return true;
    }
    

    APP.add(new class BuildCPP {

        getCPPBuildFolder(){
            return path.join(require("os").tmpdir(), ""+hash(DATA.projectName));
        }

        clean(){
            APP.log("Cleaned");
            isCleanBuild = true;
            libFlags = [];
            libSrc = {};
            libs = {};            
            objFile = {};
        }

        onOpenProject(){
            objBuffer = new Buffer();
            objBuffer.type = "o list";

            // this.clean();

            buildFolder = this.getCPPBuildFolder();
            fs.mkdir(buildFolder, _ => {
                APP.customSetVariables({buildFolder});
                this.writeCompileFlags(buildFolder);
            });
        }

        _addObj(objPath, pending){
            objBuffer.data.push(objPath);
            pending.done();
        }

        _buildProjectFiles( files, pending ){
            files.filter(f=>f.modified == true)
                .forEach( buffer => APP.writeBuffer(buffer));

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
        }

        _addLib(libPath, pending){
            let srcext = ["CPP", "C", "CC", "S"];
            let obj;
            if( typeof libPath == "object" ){
                obj = libPath;
                libPath = libPath.recurse;
            }
            
            let id = libs[libPath];
            
            // if( id ){
                
            //     this._addObj(id, pending);
                
            // }else
            if( !obj ){

                libFile.call(this, libPath, pending);

            }else if( libSrc[libPath] ){

                let src = libSrc[libPath];
                src.forEach( libPath=>{
                    // if( libs[libPath] )
                    //     this._addObj(libs[libPath], pending);
                    // else
                        libFile.call(this, libPath, pending);
                });

            }else{

                let ignore;
                if( obj.ignore )
                    ignore = new RegExp(obj.ignore, "gi");
                
                let src = libSrc[libPath] = [];
                pending.start();

                let p = new Pending(_=>{
                    src.forEach( libPath=>libFile.call(this, libPath, pending) );
                    pending.done();
                }, pending.error);

                let realPath = APP.replaceDataInString(libPath.replace(/\*/g, ""));
                libDir(realPath, src, p, ignore);

            }

            function libDir( path, src, pending, ignore ){
                libFlags.push("-I" + path);
                pending.start();
                fs.readdir(path, (error, entries)=>{
                    entries.forEach( entry =>{
                        let full = path + "/" + entry;

                        if(!validLibEntry(full, ignore))
                            return;
                        
                        pending.start();
                        
                        fs.stat( full, (err, stat)=>{
                            if(!stat){
                            } else if(stat.isDirectory() ){
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

            function libFile(srcPath, pending){
                if(isCleanBuild){
                    libFileEx.call(this, srcPath, pending);
                } else {
                    let key = hash(srcPath);
                    let objPath = path.join(buildFolder, key + ".o");
                    fs.exists(objPath, error => {
                        let exists = error === true;
                        // console.log(srcPath typeof
                        if(!exists){
                            libFileEx.call(this, srcPath, pending);
                        } else {
                            libs[path] = objPath;
                            this._addObj(objPath, pending);
                        }
                        pending.done();
                    });
                    pending.start();
                }
            }

            function libFileEx( path, pending ){

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

        }

        _getLibsConfig(){
            let libs = DATA.project.libs || {};
            libs = libs[DATA.project.target] || [];
            if(typeof libs == "string")
                libs = (DATA.project.libs || {})[libs];
            return libs;
        }

        writeCompileFlags( buildFolder = DATA.buildFolder ){
            let flags = getFlags();

            this._getLibsConfig().forEach( path => {
                flags.push(...addLib(path));
            });
            
            fs.writeFileSync(
                path.join(buildFolder, "compile_flags.txt"),
                flags.map(f=>APP.replaceDataInString(f)).join("\n"),
                "utf-8"
            );

            function addLib(libPath){
                let libFlags = [];
                let ignore;
                if( typeof libPath == "object" ){
                    if( libPath.ignore )
                        ignore = new RegExp(libPath.ignore, "gi");
                    libPath = libPath.recurse;
                }

                let realPath = APP.replaceDataInString(
                    libPath.replace(/\*/g, "")
                );

                libDir(realPath);

                return libFlags;
                
                function libDir( libPath ){
                    try{
                        const stat = fs.statSync( libPath );
                        if( !stat.isDirectory() )
                            return;

                        libFlags.push("-I" + libPath);
                        fs.readdirSync(libPath)
                            .filter(entry=>validLibEntry(entry))
                            .forEach(entry => {
                                libDir( path.join(libPath, entry) );
                            });
                    }catch(ex){}
                }
            }
        }

        writeCDB(cdb, sync){
            let propsPath = DATA.projectPath + "/.vscode/c_cpp_properties.json";
            if (!fs.existsSync(propsPath)){
                console.log("could not find " + propsPath);
                return;
            }

            cdb = JSON.stringify(cdb);
            const filePath = path.join(DATA.projectPath, "compile_commands.json");
            if( sync ){
                fs.writeFileSync(filePath, cdb, "utf-8");
            }else{
                fs.writeFile(filePath, cdb, "utf-8", _=>{});
            }

            try {
                let props = JSON.parse(fs.readFileSync(propsPath, "utf-8"));
                Object.values(props.configurations).forEach(obj=>{
                    obj.compileCommands = filePath;
                    obj.compilerPath = cdbCompilerPath;
                    // obj.includePath = cdbIncludes.map(x=>APP.replaceDataInString(x));
                    obj.intelliSenseMode = "gcc-arm";
                });

                fs.writeFileSync(propsPath, JSON.stringify(props, null, 1), "utf-8");
                console.log("Wrote " + filePath);
            }catch(ex){
                console.log(ex.stack);
            }
        }
        
        ["compile-cpp"]( files, cb ){
            failLine = null;
            cdb = [];
            objBuffer.data = [];

            let pendingLibs = new Pending(_=>{

                let pending = new Pending(_=>{
                    files.push(objBuffer);
                    this.writeCDB(cdb);
                    cb();
                }, err => {
                    cb(err);
                });
                
                this._buildProjectFiles( files, pending );
                
            }, err => {
                cb(err);
            });

            this._getLibsConfig().forEach( path => {
                this._addLib(path, pendingLibs);
            });
            
        }
    });

    function getFlags(type = "CPP"){
        let flags = APP.getFlags(type);
        if( type == "C" || type == "CPP" )
            flags.push("-D" + DATA.buildMode);
        
        return flags;
    }

    function compile( buffer, cb ){
        jobs.push({buffer, cb});
        if(workerCount >= 4) return;

        workerCount++;
        let job = jobs.pop();
        doCompile(job.buffer, (...args) => {
            workerCount--;

            if(jobs.length){
                let {buffer, cb} = jobs.pop();
                compile(buffer, cb);
            }
            
            job.cb(...args);
        });
    }

    function doCompile(buffer, cb){
        if( !buffer.path || buffer.modified ){
            
            if( !buffer.path )
                buffer.path = buildFolder + path.sep + buffer.name;

            APP.writeBuffer( buffer );
        }

        console.log(buffer.path);

        let compilerPath = DATA[
            buffer.type + "-" + DATA.project.target
        ];

        if(!compilerPath){
            compilerPath = {
                C:"gcc",
                CPP:"g++",
                S:"as"
            }[buffer.type];
        }

        compilerPath += DATA.executableExt;

        if( !objFile[ buffer.path ] )
            objFile[ buffer.path ] = hash(buffer.path);

        let id = objFile[ buffer.path ];
        let output = path.join(buildFolder, id + ".o");
        let flags = [
            buffer.path,
            ...getFlags(buffer.type),
            ...libFlags,
            "-o", output
        ];

        if(buffer.type == "C" || buffer.type == "CPP"){
            cdbCompilerPath = compilerPath;
            cdbIncludes = flags.filter(f=>f.startsWith("-I")).map(f=>f.substr(2));
        }

        var error = [];

	try {
            cdb.push({
                directory: DATA.projectPath,
                command: `"${compilerPath.replace(/([\\"])/g, "\\$1")}" ${flags.map(f=>'"'+APP.replaceDataInString(f).replace(/([\\"])/g, "\\$1")+'"').join(" ")}`,
                file: buffer.path
            });
        }catch(ex){
            console.log(ex);
        }

	const cwd = compilerPath.split(/[\\\/]/).slice(0, -1).join(path.sep);
	const PATH = cwd + ";" + process.env.PATH;
	const env = Object.assign({}, process.env, {PATH, Path:PATH});

        APP.spawn( compilerPath, {cwd, env}, ...flags )
            .on("data-err", err =>{
                let prev = "";
                let wasError = "log";
                for(let line of (err+"").split("\n")){
                    let isError = /.*?:[0-9]*:[0-9]*: error:/.test(line)?"error":"log";
                    if( failLine === null && isError == "error" ){
                        failLine = line;
                    }
                    if( isError == wasError ){
                        prev += "\n" + line;
                    }else{
                        error.push([wasError, prev]);
                        prev = line;
                        wasError = isError;
                    }
                }
                error.push([wasError, prev]);
            })
            .on("data-out", msg=>{
                error.push(["log", msg]);
            })
            .on("close", failed=>{

                if( failed ){

                    if(failLine !== null){
                        let match = failLine.match(/(.*?):([0-9]*):([0-9]*): error:/);
                        let buffer = APP.findFile( match[1], true );
                        APP.jumpTo(
                            buffer,
                            (match[2]|0)||1,
                            ((match[3]|0)||1)-1
                        );
                    }

                    cb(error);

                }else{

                    APP.logDump(error, "log");
                    cb( null, output );

                }
            });

    }
});
