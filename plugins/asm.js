APP.addPlugin("ASM", ["Text"], TextView => {
    const extensions = ["ASM", "S"];
    class ASMView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.stale = true;
            // this.ace.session.setMode("ace/mode/assembly_thumb");
        }

        getTextFrame(){}
        doAction(){}

        attach(){
            super.attach();
            this.stale = true;
            this.onDebugStandby();
        }

        onDebugStandby(){
            if( this.buffer.name != "*Disassembly*" || !this.stale )
                return;
            this.stale = false;
            let buffer = this.buffer;
            APP.gdbQuery("disas", disas => {
                this._setValue(disas);
                APP.async(_=>this.stale = true);
            });
        }

        isViewingDisassembly(){
            return this.buffer.name == "*Disassembly*" ? true : undefined;
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
