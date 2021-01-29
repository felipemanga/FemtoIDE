if(!window.headless)
APP.addPlugin("Git", ["Project"], _=>{
    
    const log = APP.log;
    const git = require('isomorphic-git');
    const fs = require('fs');
    git.plugins.set('fs', fs);
    let dir, wasInit = false, noGit = false;

    const statusMap = {
        "ignored":{ type:"info", text:"ignored" },
        "unmodified":{ type:"info", text:"OK" },
        "*modified":{ type:"button", text:"Stage", cb:gitAdd },
        "modified":{ type:"info", text:"Added" },
        "*added":{ type:"button", text:"Stage", cb:gitAdd },
        "added":{ type:"info", text:"Added" },
        "*unmodified":{ type:"info", text:"Unmodified" }
    };

    const colorMap = {
        "ignored":"",
        "unmodified":"",
        "*modified":"#552200",
        "modified":"#555500",
        "*added":"#552200",
        "added":"#555500",
        "*unmodified":"#115511"
    };
    
    function gitCommit( message ){
        git.commit({
            dir,
            message,
            author:{
                name:DATA.name,
                email:DATA.email
            }
        }).then(sha=>{
            log("Committed: " + sha);
            APP.gitRefresh();
        }).catch(ex=>{
            APP.error("Could not commit: ", ex);
        });
    }

    function gitAdd( buffer ){
        let relative = buffer.path.substr( DATA.projectPath.length+1 );
        git.add({dir, filepath:relative}).then(_=>{
            if( buffer.type == "directory" )
                APP.gitRefresh();
            else
                gitStatus(buffer);
        }).catch(ex=>{
        });
    }

    function gitStatus( buffer ){
        if( noGit || !buffer.path.startsWith(DATA.projectPath) )
            return;

        let relative = buffer.path.substr( DATA.projectPath.length+1 );
        if( relative == "" )
            return;

        if( !wasInit ){
            APP.async(_=>gitStatus( buffer ));
            return;
        }

        if( buffer.type == "directory" ){
            let action = {
                type:"button",
                label:"git",
                text:"Stage All",
                cb:gitAdd.bind(null, buffer)
            };

            APP.async(_=>{
                APP.setBufferAction( buffer, action );
            });
            return;
        }
        
        git.status({dir, filepath:relative})
            .then(result=>{
                let action = Object.assign({label:"git"}, statusMap[result]);
                if( action.cb )
                    action.cb = action.cb.bind(null, buffer);
                
                APP.setBufferAction( buffer, action );
                APP.setBufferColor( buffer, colorMap[result] );
            }).catch(ex=>{
                APP.error(relative);
                log(ex);
            });
    }

    APP.add(new class Git{
        queryMenus(){
            APP.addMenu("Git", {
                "Refresh":APP.gitRefresh,
                "Log":APP.gitLog,
                "Commit":APP.gitCommit,
                "Commit All":APP.gitCommitAll,
            });
        }

        gitCommitAll(){
            git.statusMatrix({dir})
                .then(matrix=>{
                    return Promise.all(
                        matrix
                            .filter(([file, head, work, stage])=>{
                                return (head != 1 || work != 1 || stage != 1);
                            })
                            .map(([filepath, head, work, stage])=>{
                                if( work == 0 )
                                    return git.remove({dir, filepath});
                                return git.add({dir, filepath});
                            })
                    );
                })
                .then(res=>{
                    if( res.length == 0 ){
                        APP.log("Nothing to commit");
                    }else{
                        APP.log("Added all");
                        APP.gitCommit();
                    }
                })
                .catch(ex=>{
                    APP.error((ex && ex.message) || ex);
                });
        }

        registerProjectFile( buffer ){
            gitStatus( buffer );
        }

        onFileChanged( buffer ){
            gitStatus( buffer );
        }

        onAfterWriteBuffer( buffer ){
            gitStatus( buffer );
        }

        gitLog(msg){
            if( !msg ) msg = {depth:10};
            
            log("------ GIT LOG ------");
            log("(Newest entries last)");

            git.log(Object.assign({dir}, msg))
                .then(list=>{
                    list.reverse()
                        .forEach(entry=>{
                            log(entry.message);
                        });
                });
        }

        gitRefresh(){
            DATA.projectFiles
                .filter(f=>(f.path+"").toLowerCase().startsWith(DATA.projectPath.toLowerCase()))
                .forEach( buffer=>gitStatus(buffer) );
        }

        gitCommit(msg){
            if( DATA.name == "YourName" ){
                log("You have not set your name/email in config.js");
                return;
            }

            msg = msg || prompt("Commit message:");
            if( !msg ) return;
            gitCommit(msg);
        }
        
        onOpenProject(){
            dir = DATA.projectPath;
            if( !fs.existsSync(dir + path.sep + ".git") ){
                noGit = true;
                return;
                git.init({dir}).then(result=>{
                    log("New git initialized");
                    wasInit = true;
                }).catch(ex=>{
                    log("Error initializing git: " + ex);
                });
            }else{
                wasInit = true;
                git.currentBranch({dir, fullname:false})
                    .then(name=>log(`Currently on branch ${name}`));
            }
        }
    });

});
