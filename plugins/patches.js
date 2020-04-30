APP.addPlugin("Patches", [], _=>{
    APP.add(new class Patches {
        onOpenProject(){
            const project = DATA.project;
            try{ fixOSC(project); }catch(ex){}
            try{ cpp17(project); }catch(ex){}
        }
    });

    function fixOSC(project){
        let Pokitto = DATA.project.CFlags.Pokitto;
        if(Pokitto[0] == "-D_OSC=2"){
            Pokitto[0] = "-D_OSCT=2";
            APP.dirtyProject();
        }
    }

    function cpp17(project){
        Object.keys(project.CPPFlags).forEach(key=>{
            let flags = project.CPPFlags[key];
            if(Array.isArray(flags)){
                let i = flags.indexOf("-std=c++14");

                if(i == -1)
                    i = flags.indexOf("-std=c++11");

                if(i != -1){
                    flags[i] = "-std=c++17";
                    APP.dirtyProject();
                }
            }
        });
    }
});
