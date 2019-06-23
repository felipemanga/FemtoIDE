APP.addPlugin("Image", [], _ => {
    const extensions = ["PNG", "JPG", "GIF"];
    const prefix = "piskel/index.html?";
    
    Object.assign(encoding, {
        "PNG":null,
        "GIF":null,
        "JPG":null,
    });
    
    class ImageView {
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
                className:"ImageView",
                src: prefix + buffer.path
            });
            /*
            this.DOM = DOC.create( frame, "img", {
                className:"ImageView",
                src: "file://" + buffer.path
            });
            */
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 2 ){
                vf.view = ImageView;
                vf.priority = 2;
            }
            
        }
        
    });

    return ImageView;
});
