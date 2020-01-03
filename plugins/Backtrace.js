APP.addPlugin("Backtrace", [], _=>{
    let buffer;
    
    class BacktraceNode {

        constructor( frame, parent ){
            let name = APP.demangle(frame.name);
            
	    this.DOM = DOC.create(
                "li",
                parent,
                {
                    className:"item backtrace closed",
                    text:name,
                    onclick:()=>{
                        APP.gdbCommand(`frame ` + frame.number, false);
                    }
                }
            );
        }

    }

    
    class VariableNode {

        constructor( variable, parent ){
	    this.DOM = DOC.create(
                "li",
                parent,
                { className:"item backtrace closed" },
                [
                    ["label", {text:variable.name + ": "}, [
                        ["input", {value:variable.value, disabled:true}]
                    ]]
                ]
            );
        }

    }

    class BacktraceView {
        constructor( frame, buffer ){
            APP.add(this);

            let container = this.container = DOC.create("div", {
                className:"BacktraceContainer"
            }, frame);

            this.list = DOC.create(
                "ul",
                {className:"FrameList"},
                container
            );

            this.variables = DOC.create(
                "ul",
                {className:"VarList"},
                container
            );

            this.root = null;
            this.stale = true;
            APP.async(_=>this.onDebugStandby());
        }

        onDebugStandby(){
            if( !this.stale )
                return;

            this.stale = false;
            APP.onResize();

            while( this.variables.children.length )
                this.variables.removeChild( this.variables.lastChild );

            APP.gdbQuery("info args -q", addVariables.bind(this));
            APP.gdbQuery("info locals -q", addVariables.bind(this));

            function show(){
                this.container.parentElement.style.display = "block";
            }

            function addVariables( args ){
                (args+"")
                    .split(/\r?\n/)
                    .forEach( arg => {
                        let match = arg.match(/^\s*([^=]+)=\s*(.*)$/);
                        if( !match )
                            return;
                        let name = match[1].trim();
                        let value = match[2].trim();
                        new VariableNode({name, value}, this.variables);
                        show.call(this);
                    });
            }
            
            APP.gdbQuery("bt", bt=>{
                APP.async(_=>this.stale = true);

                while( this.list.children.length )
                    this.list.removeChild( this.list.lastChild );

                (bt+"")
                    .split(/\r?\n/)
                    .forEach((frame, number)=>{
                        if( frame[0] != "#" )
                            return;
                        let match = frame
                            .match(/^#([0-9])\s+(?:.*? in )?([^\s]+)\s+(?:.* at )(.*?):([0-9]+)$/);
                        if( !match )
                            return;

                        let name = match[2];
                        let file = match[3];
                        let line = match[4];

                        new BacktraceNode({
                            number,
                            name,
                            file,
                            line
                        }, this.list);

                        show.call(this);
                    });
            });
        }

        onDebugStopped(){
            APP.closeFrame(this);
            // this.container.parentElement.style.display = "none";
            APP.onResize();
            this.stale = true;
        }

    }


    APP.add({

        pollViewForBuffer( buffer, vf ){

            if( buffer.name == "*Backtrace View*" ){
                vf.view = BacktraceView;
                vf.priority = 999;
            }
            
        },

        onDebugStandby(){
            
            if( !buffer ){
                buffer = new Buffer();
                buffer.name = "*Backtrace View*";
            }
            
            APP.displayBufferInRightFrame(buffer);            

        }

    });

});
