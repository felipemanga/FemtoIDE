APP.addPlugin("Build", ["Project"], _=>{
    APP.customSetVariables({buildMode:"RELEASE"});

    let build, busy, buildFiles;

    class Build {

        constructor(){
            APP.add(this);
            console.log("New builder");
        }

        onCloseProject(){
            APP.remove(this);
        }
        
        compileAndRun(){
            APP.stopEmulator();
            this.compile(true, _=>{
                APP.run();
            });
        }

        onAfterWriteBuffer(buffer){
            if( buildFiles && buildFiles.indexOf(buffer) == -1 && buffer.path.startsWith(DATA.projectPath)){
                buildFiles.push(buffer);
            }
        }

        buildAnyWay(){
            if(busy){
                APP.log("If you say so.");
            }
            busy = false;
        }

        compileDebug(){
            APP.compile(false);
        }

        compile( release=true, callback=null ){
            let timings = "",
                startTime = 0,
                stage = "";
            
            if( busy ){
                APP.log("Build already in progress");
                return;
            }

            busy = true;
            function cb(...args){
                busy = false;
                if( callback && typeof callback == "function" )
                    callback(...args);
                APP.onCompileComplete();
            }
            
            APP.clearLog();
            APP.customSetVariables({buildMode:release?"RELEASE":"DEBUG"});
            APP.setStatus("Compiling...");

            const target = DATA.project.target;
            let BUILDFlags = getFlags();

            let pipeline, files, current;
            try{
                pipeline = DATA.project.pipelines[target];
                if(typeof pipeline == "string")
                    pipeline = DATA.project.pipelines[pipeline];
                if(!pipeline)
                    throw `Project has no ${target} pipeline`;
                files = buildFiles = [...DATA.projectFiles];
                if(BUILDFlags.ignore){
                    let exp = new RegExp(BUILDFlags.ignore, "gi");
                    files = buildFiles = buildFiles.filter(f=>(
                        !f.path || !f.path.replace(DATA.projectPath, "").match(exp)
                    ));
                }
                current = -1;
                setTimeout(_=>popQueue(),0);
            }catch( ex ){
                APP.setStatus("Compilation FAILED");
                APP.error(ex);
                busy = false;
            }

            function getFlags(){
                let flags = {};

                let BUILDFlags = DATA.project["BUILDFlags"];

                if( !BUILDFlags ){
                    BUILDFlags = DATA.project["BUILDFlags"] = {
                        [DATA.project.target]:{}
                    };
                }
                
                if( BUILDFlags ){
                    if( BUILDFlags[DATA.project.target] )
                        Object.assign(flags, BUILDFlags[DATA.project.target]);
                    if( BUILDFlags.ALL )
                        Object.assign(flags, BUILDFlags.ALL );
                    if( BUILDFlags[DATA.buildMode] )
                        Object.assign(flags, BUILDFlags[DATA.buildMode] );
                }
                
                return flags;
            }

            function popQueue( error ){
                if( startTime ){
                    let deltaTime = performance.now() - startTime;
                    timings += stage + ":" + Math.round(deltaTime/10)/100 + "s ";
                }
                
                if( error ){
                    busy = false;
                    APP.setStatus("Compilation FAILED");
                    if(Array.isArray(error))
                        APP.logDump(error, "error");
                    else
                        APP.error(error);
                    return;
                }

                current++;
                if( current >= pipeline.length ){
                    APP.setStatus("Build time: " + timings);
                    cb();
                    return;
                }

                stage = (pipeline[current]+"").trim();
                // APP.log("Starting stage: " + stage);
                startTime = performance.now();
                try{
                    if( stage[0] == "#" ){
                        APP.shell(stage.substr(1))
                            .on("close", error=>{
                                popQueue(error);
                            })
                            .on("error", error=>{
                                popQueue(error);
                            });
                    } else {
                        let ret = APP[stage]( files, popQueue );
                        if( ret instanceof Promise ){
                            ret.then(_=>popQueue())
                                .catch(ex=>popQueue(ex));
                        }
                    }
                }catch(ex){
                    popQueue(ex);
                }
            }
        }

    }

    APP.add({

        onOpenProject(){
            new Build();
        },

        queryMenus(){
            APP.addMenu("Build", {
                "Clean":"clean",
                "Build":"compile",
                "Build (Debug)":"compileDebug",
                "Run":"run",
                "Build & Run":"compileAndRun"
            });
        }

    });

});
