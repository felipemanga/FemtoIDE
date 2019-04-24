APP.addPlugin("Tree", [], _=>{

    class TreeNode {

        constructor( buffer, parent ){
            APP.add(this);
            this.buffer = buffer;

            this.children = [];

            let actions = [];
            APP.pollBufferActions( buffer, actions );

	    this.DOM = DOC.index( DOC.create(
                "li",
                parent,
                { className:"item " + buffer.type + " closed"},
                [
                    ["div", { text:buffer.name, id:"name" }],
                    
                    [
                        "ul",
                        { id:"actions" },
                        actions.map( a => [
                            "li",
                            {
                                text:a.name,
                                onclick:a.cb,
                                className:"action " + a.name
                            }
                        ])
                    ],
                    
                    ["ul", { id:"dir" }]
                ]
            ), null, {
                name:{
                    blur:_=>{
                        if( !this.DOM.name.isContentEditable )
                            return;

                        this.DOM.name.setAttribute("contenteditable", "false");

                        let newName = this.buffer
                            .path
                            .split(/[\\/]/);
                        
                        newName[newName.length-1] = this.DOM.name.textContent.trim();
                        newName = newName.join(path.sep);
                        
                        APP.renameBuffer( buffer, newName );
                        
                    },
                    
                    click:_=>{
                        APP.displayBuffer( this.buffer );
                    }
                }
            } );

        }

        displayBuffer( buffer ){
            if( buffer == this.buffer ){
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
            this.DOM.name.setAttribute("contenteditable", "true");
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
                this.children.push( new TreeNode(buffer, this.DOM.dir) );
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

            DOC.create("input", {
                className:"search",
                onchange: e=>this.filterFiles(e.target.value)
            }, frame);

            this.fileList = DOC.create("ul", {className:"FileList"}, frame);

            this.root = null;

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

        filterFiles( str ){
            
        }
    }


    APP.add({

        pollBufferActions( buffer, actions ){
            actions.push(
                {
                    name:"rename",
                    cb:APP.renameBuffer.bind(null, buffer)
                },
                {
                    name:"delete",
                    cb:APP.deleteBuffer.bind(null, buffer)
                }
            );
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
