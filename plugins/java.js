APP.addPlugin("Java", ["Text"], TextView => {
    const extensions = ["JAVA"];
    
    class JavaView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/java");
        }

        beautify(){
            if( typeof js_beautify == "undefined" )
                return;
            let ret = js_beautify(this.ace.session.getValue());
            this.ace.session.setValue(ret);
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = JavaView;
                vf.priority = 1;
            }
            
        }
        
    });

    return JavaView;
});
