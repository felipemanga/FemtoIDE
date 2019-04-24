APP.addPlugin("Bin", [], _ => {
    const extensions = ["PNG", "JPG", "MP3", "BIN", "ELF"];
    
    class BinView {
        constructor( frame, buffer ){
            this.DOM = DOC.create( frame, "h2", {
                className:"BinView",
                text:"<<Binary data>>"
            });
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = BinView;
                vf.priority = 1;
            }
            
        }
        
    });

    return BinView;
});
