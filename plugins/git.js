APP.addPlugin("Git", ["Project"], _=>{
    
    const log = APP.log;
    const git = require('isomorphic-git');
    const fs = require('fs');
    git.plugins.set('fs', fs);
    let dir, wasInit = false;

    const statusMap = {
        "ignored":{ type:"info", text:"ignored" },
        "unmodified":{ type:"info", text:"OK" },
        "*modified":{ type:"button", text:"Stage", cb:gitAdd },
        "modified":{ type:"info", text:"Added" },
        "*added":{ type:"button", text:"Stage", cb:gitAdd },
        "added":{ type:"info", text:"Added" },
        "*unmodified":{ type:"info", text:"Unmodified" }
    };

    function gitAdd( buffer ){
        let relative = buffer.path.substr( DATA.projectPath.length+1 );
        git.add({dir, filepath:relative}).then(_=>{
            gitStatus(buffer);
        }).catch(ex=>{
        });
    }

    function gitStatus( buffer ){
        if( !buffer.path.startsWith(DATA.projectPath) )
            return;

        let relative = buffer.path.substr( DATA.projectPath.length+1 );
        if( relative == "" )
            return;
        
        if( !wasInit ){
            APP.async(_=>gitStatus( buffer ));
            return;
        }

        git.status({dir, filepath:relative})
            .then(result=>{
                let action = Object.assign({label:"git"}, statusMap[result]);
                if( action.cb )
                    action.cb = action.cb.bind(null, buffer);
                
                APP.setBufferAction( buffer, action );
            }).catch(ex=>{
                log(ex);
            });
    }

    APP.add({
        queryMenus(){
            APP.addMenu("Git", {
                "Stage Changes & Commit":APP.stageAndCommit
            });
        },

        registerProjectFile( buffer ){
            gitStatus(buffer);
        },

        stageAndCommit(msg){
            msg = msg || prompt("Commit message:");
            if( !msg ) return;
        },
        
        onOpenProject(){
            dir = DATA.projectPath;
            if( !fs.existsSync(dir) ){
                git.init({dir}).then(result=>{
                    log("New git initialized");
                    wasInit = true;
                }).catch(ex=>{
                    log("Error initializing git: " + ex);
                });
            }else{
                wasInit = true;
                log("Git project detected");
            }
        }
    });

});
