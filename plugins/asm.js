APP.addPlugin("ASM", ["Text"], TextView => {
    const extensions = ["ASM", "S"];
    
    class ASMView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            // this.ace.session.setMode("ace/mode/assembly_thumb");
        }

        doAction(){
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = ASMView;
                vf.priority = 1;
            }
            
        }
        
    });

    return ASMView;
});
