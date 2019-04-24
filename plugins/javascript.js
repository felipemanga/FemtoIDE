APP.addPlugin("JS", ["Text"], TextView => {
    const extensions = ["JS"];
    
    class JSView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/javascript");
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = JSView;
                vf.priority = 1;
            }
            
        }
        
    });

    return JSView;
});
