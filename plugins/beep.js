APP.addPlugin("Beep", [], _ => {
    const extensions = ["BEEP"];
    const prefix = "beepbox/editor.html?";

    Object.assign(encoding, {
        "RAW":null
    });
        
    class BeepView {
        attach(){
            if( this.DOM.src != prefix + this.buffer.path )
                this.DOM.src = prefix + this.buffer.path;
        }

        onRenameBuffer( buffer ){
            if( buffer == this.buffer ){
                this.DOM.src = prefix + this.buffer.path;
            }
        }
        
        constructor( frame, buffer ){
            this.buffer = buffer;
            this.DOM = DOC.create( frame, "iframe", {
                className:"BeepView",
                src: prefix + buffer.path
            });
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 2 ){
                vf.view = BeepView;
                vf.priority = 2;
            }
            
        }
        
    });

    return BeepView;
});
