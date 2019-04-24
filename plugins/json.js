APP.addPlugin("JSON", ["Text"], TextView => {
    const extensions = ["JSON"];
    
    class JSView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/json");
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
