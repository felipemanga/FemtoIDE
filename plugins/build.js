APP.addPlugin("Build", ["Project"], _=>{
    APP.customSetVariables({buildMode:"RELEASE"});

    let build, busy;

    class Build {

        constructor(){
            APP.add(this);
            console.log("New builder");
        }

        onCloseProject(){
            APP.remove(this);
        }
        
        clean(){
            console.log("onCleanBuildFolder");
        }

        compileAndRun(){
            APP.stopEmulator();
            this.compile(true, _=>{
                APP.run();
            });
        }

        compile( release=true, callback=null ){
            if( busy ){
                APP.log("Build already in progress");
                return;
            }

            busy = true;
            function cb(...args){
                busy = false;
                if( callback && typeof callback == "function" )
                    callback(...args);
            }
            
            APP.clearLog();
            APP.customSetVariables({buildMode:release?"RELEASE":"DEBUG"});

            let pipeline, files, current;
            try{
                const target = DATA.project.target;
                pipeline = DATA.project.pipelines[target];
                files = [...DATA.projectFiles];
                current = -1;
                popQueue();
            }catch( ex ){
                console.error(ex);
            }

            function popQueue( error ){
                if( error ){
                    APP.setStatus("Compilation FAILED");
                    APP.error(error);
                    return;
                }

                current++;
                if( current >= pipeline.length ){
                    APP.setStatus("Compilation OK " + DATA.buildFolder);
                    cb();
                    return;
                }

                let stage = pipeline[current];
                APP[stage]( files, popQueue );
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
                "Run":"run"
            });
        }

    });

});
