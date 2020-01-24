APP.addPlugin("HTML", ["Text"], TextView => {
    const extensions = ["HTML", "HTM"];
    
    class HTMLView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/xml");
            this.sourceMode = true;
            this.preview = DOC.create(
                frame,
                "iframe",
                {
                    style:{
                        position:"absolute",
                        width:"100%",
                        height:"100%",
                        top:0,
                        left:0,
                        padding:0,
                        margin:0,
                        border:0,
                        zIndex:10,
                        display:"none"
                    },
                    onload:evt=>{
                        const win = evt.target.contentWindow;
                        win.require = require;
                        win.APP = APP;
                        win.DATA = DATA;
                        if(win.onFemtoReady) win.onFemtoReady();
                        win.document.addEventListener("keydown", evt=>{
                            if(evt.key == "Enter" && evt.ctrlKey)
                                this.toggleMode();
                        });
                    }
                }
            );

            this.toggleMode();
        }

        compile(){
            if(this.preview.contentWindow.onFemtoCompile)
                this.preview.contentWindow.onFemtoCompile();
        }

        compileAndRun(){
            if(this.preview.contentWindow.onFemtoCompile)
                this.preview.contentWindow.onFemtoCompile();
        }

        doAction(){
            this.toggleMode();
        }

        toggleMode(){
            if( this.preview.style.display == "none" ){
                this.preview.style.display = "block";
                this.preview.src = "file://" + this.buffer.path.replace(/\\/g, "/") + "?" + Math.random();
            }else{
                this.preview.style.display = "none";
            }
        }
        
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 2 ){
                vf.view = HTMLView;
                vf.priority = 2;
            }
            
        }
        
    });

    return HTMLView;
});
