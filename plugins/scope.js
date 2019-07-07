APP.addPlugin("Scope", [], _=>{
    let scopeWindow;

    APP.add({
        queryMenus(){
            APP.addMenu("Debug", {
                "Scope":"scope"
            });
        },

        scope(){

            if(scopeWindow || !APP.isEmulatorRunning())
                return;

            nw.Window.open("www/scope.html?port=2000", {
                width:400,
                height:600
            }, w=>{
                scopeWindow = w;
                scopeWindow.on("close", _=>scopeWindow=null);
            });


        }
    });
});
