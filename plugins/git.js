APP.addPlugin("Git", ["Project"], _=>{
    const log = APP.log;
    const git = require('isomorphic-git');
    const fs = require('fs');
    git.plugins.set('fs', fs);
    let dir;

    APP.add({
        queryMenus(){
            APP.addMenu("Git", {
                "Stage Changes & Commit":APP.stageAndCommit
            });
        },

        stageAndCommit(msg){
            msg = msg || prompt("Commit message:");
            if( !msg ) return;
        },
        
        onOpenProject(){
            dir = DATA.projectPath + path.sep + ".git";
            if( !fs.existsSync() ){
                git.init({dir}).then(result=>{
                    log("New git initialized");
                }).catch(ex=>{
                    log("Error initializing git: " + ex);
                });
            }else{
                log("Git project detected");
            }
        }
    });

});
