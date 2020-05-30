APP.addPlugin("Update", [], _=>{
    const git = require('isomorphic-git');
    const fs = require('fs');

    git.plugins.set('fs', fs);
    const dir = path.join(DATA.appPath, "PokittoLib");

    function initPokittoLibGit(){
        APP.log("First time initialization.");
        APP.log("This will take a while.");
        let step = 0;
        git.init({dir})
            .then(_=>{
                step++;
                return git.addRemote({
                    dir,
                    remote: "origin",
                    url: "https://github.com/Pokitto/PokittoLib"
                });
            })
            .then(_=>{
                step++;
                return git.fetch({
                    dir,
                    singleBranch: true,
                    ref: "master",
                    remoteRef: "master"
                });
            })
            .then(_=>{
                step++;
                return git.checkout({
                    dir,
                    ref: "master",
                    force: "true"
                });
            })
            .then(_=>{
                APP.log("Update complete!");
            })
            .catch(ex=>{
                APP.error("Error on step " + step, ex);
            });
    }

    APP.add(new class Update {
        updatePokittoLib(){
            try{
                fs.statSync(path.join(dir, ".git"));
            }catch(ex){
                initPokittoLibGit();
                return;
            }

            APP.log("Checking for updates...");
            try{
                git.pull({
                    dir
                }).then(res=>{
                    APP.log("Update complete!", res);
                }).catch(ex=>{
                    APP.error(ex);
                });
            }catch(ex){
                APP.error(ex);
            }
        }

        queryMenus(){
            APP.addMenu(" femto", {
                "Update PokittoLib":"updatePokittoLib"
            });
        }
    });
});
