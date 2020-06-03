APP.addPlugin("Bassoon", [], _ => {
    const extensions = ["MOD", "XM"];
    const prefix = "BassoonTracker/dev.html?";

    Object.assign(encoding, {
        "MOD":null,
        "XM":null,
        "PMF":null
    });
        
    class BassoonView {
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
                className:"BassoonView",
                src: prefix + buffer.path
            });
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 2 ){
                vf.view = BassoonView;
                vf.priority = 2;
            }
            
        }
        
    });

    return BassoonView;
});
