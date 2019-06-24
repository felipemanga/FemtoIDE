APP.addPlugin("Tree", [], _=>{

    class TreeNode {

        constructor( buffer, parent ){
            APP.add(this);
            this.buffer = buffer;
            this.parent = null;
            this.children = [];
            this.y = 0;
            buffer.pluginData.TreeNode = this;

	    this.DOM = DOC.index( DOC.create(
                "li",
                parent,
                { className:"item " + buffer.type + " closed"},
                [
                    ["div", {id:"itemContainer"}, [
                        ["button", {
                            className: "itemExpander",
                            text: " ",
                            onclick:_=>{
                                this.DOM.__ROOT__.classList.toggle("expand");
                            }
                        }],
                        ["div", { text:buffer.name, id:"name" }],
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
                    
                    click:_=>{
                        APP.displayBuffer( this.buffer );
                    }
                }
            } );
            
            APP.async(_=>this._render(parent));

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

        _render( parent ){
            let buffer = this.buffer;
            let actions = [];
            APP.pollBufferActions( buffer, actions );

            actions.forEach( a => DOC.create(...makeAction.call(this, a)) );

            function makeAction( meta ){
                let type = "_makeAction_" + meta.type;
                if( !this[type] )
                    type = "_makeAction_";
                return [
                    "li",
                    { className:"action " + type },
                    this[type]( meta ),
                    this.DOM.actions
                ];
            }
        }

        _makeAction_( meta ){
            return [[{ text: "Unknown: " + meta.type }]];
        }

        _makeAction_button( meta ){
            return [[{
                text:meta.label,
                onclick:meta.cb,
            }]];
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

        displayBuffer( buffer ){
            let open = buffer == this.buffer;
            let unfolded = this.folded;
            
            if( !unfolded && buffer.pluginData.TreeNode ){
                let node = buffer.pluginData.TreeNode;
                while( node ){
                    if( node == this ){
                        unfolded = true;
                        break;
                    }
                    node = node.parent;
                }
            }
            
            if( open ){
                this.DOM.__ROOT__.classList.remove("closed");
                this.DOM.__ROOT__.classList.add("open");
            }else{
                this.DOM.__ROOT__.classList.add("closed");
                this.DOM.__ROOT__.classList.remove("open");
            }
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
                let child = new TreeNode(buffer, this.DOM.dir);
                child.parent = this;
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
                {className:"FileList"},
                container
            );

            this.root = null;

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
                this.root = new TreeNode( file, this.fileList );
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
                    label:"rename",
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
                            let fb = APP.findFile(buffer.path + "/" + name, true);
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

                            fs.mkdirSync(buffer.path + "/" + name);
                            let fb = APP.findFile(buffer.path + "/" + name, false);
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
