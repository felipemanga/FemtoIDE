APP.addPlugin("Help", [], _=>{
    APP.add(new class Help {
        queryMenus(){
            APP.addMenu(" &#x1f175;", {
                "Help":"help"
            });
        }
        
        help(){

            let file = "index.html";

            let entry = APP.resolveJavaUnderCursor();
            if( entry ){
                let classFile = [];

                while(entry && !entry.isClass)
                    entry = entry.scope;

                while(entry){
                    let name = entry.name;
                    if( typeof name == "string" )
                        name = [name];
                    classFile.unshift(...name);
                    entry = entry.scope;
                }

                classFile = "class" +
                    classFile.join("_1_1") +
                    ".html";
                
                if( fs.existsSync(DATA.appPath + "/www/docs/" + classFile) )
                    file = classFile;
            }
            
            let width = (localStorage.getItem("helpwidth")|0) || 800;
            let height = (localStorage.getItem("helpheight")|0) || 600;
            
            nw.Window.open('www/docs/' + file, {width, height}, win=>{
                win.on("close", _=>{
                    width = win.width;
                    height = win.height;
                    localStorage.setItem("helpwidth", width);
                    localStorage.setItem("helpheight", height);
                    win.close(true);
                });
            });            
        }
    });
});
