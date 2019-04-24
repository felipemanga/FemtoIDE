APP.addPlugin("Build", ["Project"], _=>{

    let build;

    class Build {

        constructor(){
            APP.add(this);
            console.log("New builder");
        }

        clean(){
            console.log("onCleanBuildFolder");
        }

        compile(){
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
                    return;
                }

                let stage = pipeline[current];
                APP[stage]( files, popQueue );
            }
        }

    }

    APP.add({

        onCloseProject(){
            if( build )
                APP.remove(build);
        },

        onOpenProject(){
            build = new Build();
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
