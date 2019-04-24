APP.addPlugin("CPP", ["Text"], TextView => {
    const extensions = ["CPP", "C", "H", "HPP", "CC"];
    
    class CPPView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/c_cpp");
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = CPPView;
                vf.priority = 1;
            }
            
        }
        
    });

    return CPPView;
});
