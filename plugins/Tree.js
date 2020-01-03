APP.addPlugin("Tree", [], _=>{
    document.body.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    function makeAction( meta ){
        let parent = this.DOM.actions;
        
        if( meta.category ){
            if( this.actions[meta.category] ){
                parent = this.actions[meta.category];
            }else{
                parent = DOC.create("li",
                                    {className:"action category folded"},
                                    [
                                        [{
                                            text:meta.category,
                                            onclick:_=>parent.classList.toggle("folded")
                                        }]
                                    ],
                                    parent
                          );
            }
        }
        
        let type = "_makeAction_" + meta.type;
        if( !this[type] )
            type = "_makeAction_";

        return [
            "li",
            { className:"action " + meta.type },
            this[type]( meta ),
            parent
        ];
    };

    

    class TreeNode {

        constructor( buffer, depth, parent ){
            APP.add(this);
            this.buffer = buffer;
            this.parent = null;
            this.children = [];
            this.actions = {};
            this.y = 0;
            this.depth = depth;
            this.isOpen=(depth == 1 ? true : false);
            
            buffer.pluginData.TreeNode = this;

            try {
                this.iconsData=require('../www/images/material-icons.json');
            } catch (error) {
                this.iconsData=null;
            }
            

	    this.DOM = DOC.index( DOC.create(
                parent,
                "li",
                { className:"item " + buffer.type + " " + (depth == 1 ? "open" : "closed")},
                [
                    ["div", {id:"itemContainer"}, [
                        ["div", { style:{marginLeft:(depth*15)+"px"}, id:"line", title:buffer.path,
                            onclick:evt=>{
                                this.DOM.__ROOT__.classList.toggle("closed");
                                this.DOM.__ROOT__.classList.toggle("open");
                                this.isOpen=!this.isOpen;
                                this.DOM.__ROOT__.getElementsByTagName('img')[0].src=this.getIcon(buffer.type, buffer.name, this.isOpen);
                            }
                        }, [
                            (buffer.type == "directory" ? ["div", {
                                className:"dirMark"
                            }] : null),
                            ["img", {id:"icon", width:16, height:16, src:this.getIcon(buffer.type, buffer.name, this.isOpen), alt:""}],
                            ["div", {id:"name", text:buffer.name}]
                        ]],
                        [
                            "ul",
                            { id:"actions" },
                        ]
                    ]],
                    ["ul", { id:"dir" }]
                ]
            ), null, {
                name:{
                    keydown:event=>{
                        if( event.key == "Enter" )
                            event.target.blur();
                    },
                    blur:_=>{
                        if( !this.DOM.name.isContentEditable )
                            return;

                        this.DOM.name.setAttribute("contenteditable", "false");

                        let newName = this.buffer
                            .path
                            .split(/[\\/]/);
                        
                        newName[newName.length-1] = this.DOM
                            .name
                            .textContent
                            .trim()
                            .replace(/\n/g, "");
                        
                        newName = newName.join(path.sep);
                        
                        APP.renameBuffer( buffer, newName );
                        
                    },
                    
                    click:evt=>{
                        APP.displayBuffer( this.buffer );
                    },

                    mousedown:evt=>{
                        if( evt.button != 2 )
                            return;
                        
                        let isExpanded = this.DOM.__ROOT__.classList.contains("expand");
                        APP.hideTreeActions();
                        
                        if( !isExpanded )
                            this.DOM.__ROOT__.classList.add("expand");
                    }
                }
            } );
            
            APP.async(_=>this._render());

        }

        getIcon( type , name, isOpen){
            if(this.iconsData==null)
                return "";
            if(type=="directory")
            {
                if(isOpen)
                {
                    if(this.iconsData.folderNamesExpanded[name.toLowerCase()])
                        return this.iconsData.iconDefinitions[this.iconsData.folderNamesExpanded[name.toLowerCase()]].iconPath;
                    else
                        return this.iconsData.iconDefinitions[this.iconsData.folderExpanded].iconPath;
                }
                    
                else
                {
                    if(this.iconsData.folderNames[name.toLowerCase()])
                        return this.iconsData.iconDefinitions[this.iconsData.folderNames[name.toLowerCase()]].iconPath;
                    else
                        return this.iconsData.iconDefinitions[this.iconsData.folder].iconPath;
                } 
            }
            else
            {
                if(this.iconsData.fileNames[name.toLowerCase()])
                    return this.iconsData.iconDefinitions[this.iconsData.fileNames[name.toLowerCase()]].iconPath;
                else if(this.iconsData.fileExtensions[type.toLowerCase()])
                    return this.iconsData.iconDefinitions[this.iconsData.fileExtensions[type.toLowerCase()]].iconPath;
                else
                    return this.iconsData.iconDefinitions[this.iconsData.file].iconPath;
            }
        }

        onDisplayBuffer( buffer ){
            if( buffer == this.buffer ){
                this.DOM.__ROOT__.classList.add("current");
            }else{
                this.DOM.__ROOT__.classList.remove("current");
            }
        }

        hideTreeActions(){
            this.DOM.__ROOT__.classList.remove("expand");
        }

        pollFirstVisibleTreeItem( ret ){
            if( this.DOM.itemContainer.classList.contains("hidden") )
                return;

            this.y = 0;
            let e = this.DOM.__ROOT__;
            while( e ){
                this.y += e.offsetTop;
                e = e.parentElement;
            }
            
            if( !ret.length || ret[0].y > this.y )
                ret[0] = this;
            
        }

        filterFiles( str ){
            str += "";
            let name = this.buffer.name;
            let visible = true;
            if( str != "" ){
                let i=-1;
                for( let j=0; j<str.length; ++j ){
                    let c = str[j];
                    i = name.indexOf(c, i+1);
                    if( i ==-1 ){
                        visible = false;
                        break;
                    }
                }
            }

            if( visible ) this.DOM.itemContainer.classList.remove("hidden");
            else this.DOM.itemContainer.classList.add("hidden");            
        }

        _render( ){
            let buffer = this.buffer;
            let actions = [];
            APP.pollBufferActions( buffer, actions );

            actions.forEach( a => {
                this.actions[a.label] = DOC.create(...makeAction.call(this, a));
            });

        }

        setBufferColor(buffer, color){
            if( buffer != this.buffer )
                return;
            this.DOM.itemExpander[0].style.background = color;
        }

        setBufferAction(buffer, meta){
            if( buffer != this.buffer )
                return;

            if( this.actions[meta.label] )
                this.actions[meta.label].remove();

            this.actions[meta.label] = DOC.create(...makeAction.call(this, meta));
        }

        _makeAction_( meta ){
            return [[{ text: "Unknown: " + meta.type }]];
        }

        _makeAction_info( meta ){
            return [[{
                className:"info",
                text:meta.label + ": " + meta.text
            }]];
        }

        _makeAction_button( meta ){
            return [[{
                className:"button",
                text:(meta.label || "") + (meta.label&&meta.text?": ":"") + (meta.text || ""),
                onclick:meta.cb,
            }]];
        }

        _makeAction_file( meta ){
            return (
                [["label",
                  {text:meta.label},
                  [
                      ["div", [
                          [{text:meta.value}],
                          ["input", {
                              type:"file",
                              onchange:evt=>{
                                  meta.value = meta.cb(evt.target.value);
                                  meta.value = meta.value.replace(DATA.projectPath, "${projectPath}")
                                      .replace(DATA.projectsPath, "${projectsPath}")
                                      .replace(DATA.appPath, "${appPath}");

                                  evt.target.parentElement.children[0].textContent = meta.value.replace(/([^a-z0-9])/gi, "$1\u200B");
                              }
                          }]
                      ]]
                  ]]
                ]
            );
        }

        _makeAction_input( meta ){
            return (
                [["label",
                  {text:meta.label},
                  [
                      ["input", {
                          value:meta.value,
                          onchange:evt=>{
                              meta.value = meta.cb(evt.target.value);
                          }
                      }]
                  ]]
                ]
            );
        }

        _makeAction_bool( meta ){
            return (
                [["label",
                  {text:meta.label},
                  [
                      ["input", {
                          type:"checkbox",
                          checked:meta.value,
                          onchange:evt=>meta.cb(evt.target.checked)
                      }]
                  ]]
                ]
            );
        }

        detach(){
            APP.remove(this);
            this.children.forEach( c => c.detach() );
        }

        onRenameBuffer( buffer ){
            if( buffer == this.buffer ){
                this.DOM.name.textContent = buffer.name;
            }
        }

        renameBuffer( buffer, newName ){
            if( buffer != this.buffer || typeof newName == "string" )
                return;
            this.DOM.name.setAttribute("contenteditable", "plaintext-only");
            this.DOM.name.focus();
        }

        onDeleteBuffer( buffer ){
            if( buffer != this.buffer )
                return;
            this.detach();
            this.DOM.__ROOT__.remove();
        }

        addFile( path, buffer ){
            if( !path ){
                throw "Sanity check";
            }else if( path.length == 1 ){
                if( this.children.find( child => child.buffer == buffer ) )
                    return;
                let next = this.children.find( child => child.buffer.name > buffer.name );
                if( next && next.DOM && [...this.DOM.dir.children].indexOf(next.DOM.__ROOT__) == -1 )
                    next = null;
                
                let child = new TreeNode(buffer, this.depth+1);
                child.parent = this;
                if( next ){
                    this.DOM.dir.insertBefore( child.DOM.__ROOT__, next.DOM.__ROOT__ );
                }else{
                    this.DOM.dir.appendChild( child.DOM.__ROOT__ );
                }
                this.children.push( child );
            }else{
                let child = this.children.find( child => child.buffer.name == path[0] );
                if( !child )
                    throw "Missing directory " + path[0];

                path.shift();
                child.addFile( path, buffer );

            }
        }

    }

    class TreeView {
        constructor( frame, buffer ){
            APP.add(this);

            this.filter = DOC.create("input", {
                className:"search",
                placeholder:"Filter files",
                onkeyup: e=>{

                    if( e.key != "Enter" ){
                        APP.filterFiles(e.target.value);
                        return;
                    }

                    let file = [];
                    APP.pollFirstVisibleTreeItem(file);
                    if( !file.length )
                        return;

                    APP.displayBuffer(file[0].buffer);

                    this.filter.value = "";
                    APP.filterFiles("");
                }
            }, frame);

            let container = DOC.create("div", {
                className:"FileListContainer"
            }, frame);

            this.fileList = DOC.create(
                "ul",
                {className:"FileList notfiltering"},
                container
            );

            this.root = null;

        }

        filterFiles(str){
            if( str != "" )
                this.fileList.classList.remove("notfiltering");
            else
                this.fileList.classList.add("notfiltering");
        }

        focusFilter(){
            this.filter.focus();
        }

        detach(){
            if( this.root )
                this.root.detach();
        }

        registerProjectFile( file ){
            if( !this.root )
                this.root = new TreeNode( file, 1, this.fileList );
            else{
                let relative = file.path;
                if( relative.startsWith( DATA.projectPath ) )
                    relative = relative.substr( DATA.projectPath.length + 1 );

                this.root.addFile( relative.split(path.sep), file );
            }
        }

    }


    APP.add({

        pollBufferActions( buffer, actions ){
            actions.push(
                {
                    type:"button",
                    label:"Open Externally",
                    cb:APP.openExternally.bind(null, buffer)
                },
                {
                    type:"button",
                    label:"Rename",
                    cb:APP.renameBuffer.bind(null, buffer)
                }
            );

            if( buffer.type != "directory" ){
                actions.push(
                {
                    type:"button",
                    label:"delete",
                    cb:_=>{
                        if( confirm(`Do you really want to delete ${buffer.name}?`) )
                            APP.deleteBuffer(buffer);
                    }
                }
                );
            }else{
                actions.push(
                    {
                        type:"button",
                        label:"New File...",
                        cb:_=>{
                            let name = prompt("Name:");
                            if( !name ) return;
                            let fb = APP.findFile(buffer.path + path.sep + name, true);
                            if( !fb ) return;
                            if( DATA.projectFiles.indexOf(fb) > -1 )
                                return;
                            
                            APP.touchBuffer(fb);
                            APP.registerProjectFile(fb);
                            DATA.projectFiles.push(fb);
                        }
                    },
                    {
                        type:"button",
                        label:"New Folder...",
                        cb:_=>{
                            let name = prompt("Name:");
                            if( !name ) return;

                            fs.mkdirSync(buffer.path + path.sep + name);
                            let fb = APP.findFile(buffer.path + path.sep + name, false);
                            if( !fb ) return;
                            fb.type = "directory";
                            if( DATA.projectFiles.indexOf(fb) > -1 )
                                return;
                            APP.registerProjectFile(fb);
                        }
                    }                    
                );
            }
        },

        pollViewForBuffer( buffer, vf ){

            if( buffer.name == "*Tree View*" ){
                vf.view = TreeView;
                vf.priority = 999;
            }
            
        },

        onOpenProject(){

            let buffer = new Buffer();
            buffer.name = "*Tree View*";

            APP.displayBufferInLeftFrame(buffer);
            
        }

    });

});
