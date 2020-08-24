APP.addPlugin("Discord", [], _=>{
    APP.add({

        queryMenus(){
            APP.addMenu(" femto", {
                "Ask FManga":_=>{
                    require('nw.gui').Shell.openExternal("https://discord.gg/TtqQcVA");
                }
            });
        },

    });

});
