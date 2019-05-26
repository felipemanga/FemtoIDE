APP.addPlugin("Project", [], _=>{
    
    function copyRecursiveSync(src, dest) {
        let ret = null;
        
        try {

            let exists = fs.existsSync(src);
            let stats = exists && fs.statSync(src);
            let isDirectory = exists && stats.isDirectory();

            if (exists && isDirectory) {

                if( !fs.existsSync(dest) )
                    fs.mkdirSync(dest);

                fs.readdirSync(src).forEach( childItemName => {
                    ret = ret || copyRecursiveSync(
                        path.join(src, childItemName),
                        path.join(dest, childItemName)
                    );
                });
                
            } else if ( !src.split( path.sep ).pop().startsWith("__") ) {
                
                fs.copyFileSync(src, dest);
                
            }
            
        }catch( ex ){
            console.warn( ex );
            return ex.message;
        }

        return ret;

    };

    let project = {}, dirtyHnd;

    APP.add({

        dirtyProject(){
            if( dirtyHnd )
                clearTimeout(dirtyHnd);
            dirtyHnd = setTimeout( APP.saveProject, 1000 );
        },

        saveProject(){
            fs.writeFileSync(
                DATA.projectPath + path.sep + "project.json",
                JSON.stringify(DATA.project, null, "\t"),
                "utf-8"
            );
        },

        onDeleteBuffer( buffer ){
            let pf = DATA.projectFiles;
            let index = pf.indexOf(buffer);
            if( index == -1 )
                return;
            pf.splice(index, 1);
        },
/*
        queryMenus(){
            APP.addMenu("File", {
                "New Project":"newProject",
                "Exit":"exit"
            });
        },
*/        
        pollViewForBuffer( buffer, vf ){

            if( buffer.name == "*New Project*" ){
                vf.view = NewProjectView;
                vf.priority = 999;
            }
            
        },

        newProject(){
            let name = "*New Project*";
            let buffer = DATA.buffers.find( b=>b.name == name);
            if( !buffer ){
                buffer = new Buffer( true );
                buffer.name = name;
            }

            APP.displayBuffer(buffer);
        },
        
        openProject( projectPath ){
            if( !projectPath )
                return;

            if( DATA.project )
                APP.onCloseProject();

            APP.killAllBuffers();
            APP.resetMenus();

            APP.customSetVariables({
                projectPath,
                projectFiles:[],
                projectName:projectPath.split(path.sep).pop(),
                project: JSON.parse(
                    fs.readFileSync(
                        projectPath + path.sep + "project.json", "utf-8"
                    )
                )
            });

            APP.onOpenProject();

            let oldMeta = DATA.project.files;
            DATA.project.files = {};

            loadProjectFiles(_=>{

                APP.findFile( `${projectPath}${path.sep}${DATA.project.lastBuffer}`, true );
                
            });

            function loadProjectFiles( cb ){
                let pending = 1;

                let buffer = APP.findFile( projectPath, false );
                buffer.type = "directory";
                APP.registerProjectFile(buffer);
                DATA.projectFiles.push(buffer);

                readdir( projectPath );
                popQueue();

                function readdir( p ){
                    pending++;

                    fs.readdir( p, (err, files) => {

                        pending += files.length;

                        files.forEach( f => {
                            let full = p + path.sep + f;

                            if( /^\.|~$/.test(f) ){
                                popQueue();
                                return;
                            }

                            fs.stat( full, (err, stat)=>{

                                let buffer = APP.findFile( full, false );

                                if( stat.isDirectory() ){
                                    buffer.type = "directory";
                                    readdir( full );
                                }else{
                                    let relative = full.substr(projectPath.length+1);
                                    let meta = oldMeta[relative];
                                    if( !meta )
                                        meta = {};
                                    DATA.project.files[relative] = meta;
                                    
                                }

                                APP.registerProjectFile(buffer);
                                DATA.projectFiles.push(buffer);
                                
                                popQueue();
                            });
                        });
                        
                        popQueue();
                    });
                }

                function popQueue(){
                    pending--;
                    if( pending ) return;
                    cb();
                }
            }
            
        },

        createNewProject( settings ){
            let projectPath = settings.path + path.sep + settings.name;
            
            let errmsg = copyRecursiveSync(
                DATA.templatesPath + path.sep + settings.template,
                projectPath
            );
            
            if( errmsg )
                return errmsg;

            if( settings.filesToEdit ){

                settings.projectPath = projectPath;

                let nameList = settings.filesToEdit.split(/\s*,\s*/);
                for( let name of nameList ){
                    
                    let file = fs.readFileSync(
                        `${projectPath}${path.sep}${name}`,
                        'utf-8'
                    );
                    
                    file = file.replace( /\$\{\{([^}]+)\}\}/g, ( m, key )=>{
                        let value = settings[key];
                        if( value === undefined ) value = '${' + key + '}';
                        return value;
                    });

                    fs.writeFileSync(
                        `${projectPath}${path.sep}${name}`,
                        file, 
                        'utf-8'
                    );
                    
                }

            }
            
            return true;
        }

    });

    importData({ templatesPath: DATA.appPath + path.sep + "templates" });

    let templates = fs.readdirSync( DATA.templatesPath );

    templates = templates.sort( (a, b) => (parseInt(a)||1) - (parseInt(b)||1) );

    const layout = [
        "div", { id:"NewProjectView" }, [
            
            ["label", {text:"Path"}, [
                ["input", {id:"path"}]
            ]],
            
            ["label", {text:"Name"}, [
                ["input", {id:"name", value:"NewProject"}]
                ]],

            ["label", {text:"Type"}, [
                ["select", {className:"INPUT", id:"template"},
                 templates.map( text => ["option", {value:text, text}] )
                ]
            ]],
            
            ["div", {id:"templateVars"}],
            
            ["button", {id:"confirm", text:"OK"}],
            
            ["div", {id:"errmsg"}]
        ]];

    class NewProjectView {

        kill(){
            this.DOM.NewProjectView.remove();
        }

        constructor( frame, buffer ){
            let THIS = this;
            this.css = "blocking";

            let DOM = this.DOM = DOC.index( DOC.create( frame, ...layout ), null, {

                confirm:{
                    
                    click(){
                        let settings = [...DOM.NewProjectView
                                        .querySelectorAll("INPUT,SELECT,TEXTAREA")
                                       ].reduce((obj, inp) =>{
                                           obj[inp.id] = inp.value;
                                           return obj;
                                       }, {});
                        
                        let errmsg = APP.createNewProject( settings );

                        if( errmsg !== true ){
                            DOM.errmsg.textContent = errmsg;
                        }else{
                            APP.openProject(
                                settings.path + path.sep + settings.name
                            );
                        }
                        
                    }
                    
                },

                template:{
                    change(){
                        THIS.changeTemplate( DOM.template.value );
                    }
                }
                
            });

            DOM.path.value = DATA.projectsPath;

            this.changeTemplate( DOM.template.value );
            
        }


        changeTemplate( templateName ){
            
            let tvars = {};
            let flags = DATA.templatesPath
                + path.sep
                + templateName
                + path.sep
                + "__flags.json";

            try{
                tvars = JSON.parse(
                    fs.readFileSync( flags, "utf-8" )
                );
            }catch(ex){
                // console.error(ex);
            }

            this.DOM.templateVars.innerHTML = '';
            DOC.create( this.DOM.templateVars, tvars );

        }
        
    };

});
