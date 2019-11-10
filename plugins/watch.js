APP.addPlugin("Watch", [], _=>{
    let watches = {};
    let ignore = {};
    let sep = path.sep;
    
    APP.add({
        onOpenProject(){
            removeWatches();
        },

        onBeforeWriteBuffer( buffer ){
            let path = buffer.path;
            if( fs.existsSync(buffer.path) ){
                addToIgnoreList(path);
                addToIgnoreList(path.split(/[\\\/]/).slice(0, -1).join(sep));
            }
        },

        registerProjectFile( buffer ){
            if( watches[buffer.path] )
                return;

            watches[buffer.path] = true;
            try{
                fs.watch(buffer.path, {
                    persistent:false,
                    recursive:false
                }, onFileChanged.bind(null, buffer.path));
            }catch(ex){
                // file might have been deleted by this point
            }
        }
    });

    function addToIgnoreList(path){
        if( ignore[path] )
            return;
        ignore[path] = setTimeout(unignore.bind(null, path), 100);
    }

    function unignore( path ){
        delete ignore[path];
    }

    function removeWatches(){
        watches = {};
        // APP.log("Reset watch");
    }

    function onFileChanged( path, event, file ){
        if( (path in ignore) || !(path in watches) ){
            APP.log(`Changed ignored: ${path} "${event}" ${file}`);
            // return;
        }else{
            APP.log(`File Changed: ${path} "${event}" ${file}`);
        }

        let buffer = APP.findFile(path, false);

        /*
        if( buffer.type != "directory" )
            addToIgnoreList(path);
        else if( file ){
            if( (path + sep + file) in ignore )
                return;
            addToIgnoreList(path + sep + file);
        }
        */
        
        fs.stat(path, (err, stat)=>{
            /*
            if( !buffer )
                return;
            */
            if( err ){
                APP.killBuffer(buffer);
                APP.onDeleteBuffer(buffer);
                // APP.log("File removed: ", path);
            }else{
                if( buffer.type == "directory" ){
                    let filePath = buffer.path + sep + file;
                    
                    fs.stat(filePath, (err, stat)=>{
                        let buffer = APP.findFile( filePath, false );
                        if( !err ){
                            if( DATA.projectFiles.indexOf(buffer) == -1 ){
                                if( stat.isDirectory() ){
                                    buffer.type = "directory";
                                    APP.loadProjectFiles(filePath);
                                }else{
                                    // APP.log("File Added: ", filePath);
                                    DATA.projectFiles.push(buffer);
                                    APP.registerProjectFile(buffer);
                                }

                            }else{
                                buffer.modified = false;
                                buffer.data = null;
                                APP.onFileChanged( buffer );
                            }
                        }else{
                            APP.killBuffer(buffer);
                            APP.onDeleteBuffer(buffer);
                            // APP.log("File removed: ", path);
                        }
                    });
                    
                }else{
                    if( !buffer.type && stat.isDirectory() )
                        buffer.type = "directory";
                    // APP.log("File Changed: ", path);
                    buffer.modified = false;
                    buffer.data = null;
                    APP.onFileChanged( buffer );
                }
            }
        });
    }
});
