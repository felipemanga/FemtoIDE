APP.addPlugin("Python", ["Text"], TextView => {
    const extensions = ["py"];
    
    class PythonView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/python");
        }

        doAction(){
            APP.compileAndRun();
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = PythonView;
                vf.priority = 1;
            }
            
        }
        
    });

    return PythonView;
});
