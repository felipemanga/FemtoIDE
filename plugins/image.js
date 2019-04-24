APP.addPlugin("Image", [], _ => {
    const extensions = ["PNG"];
    
    class ImageView {
        constructor( frame, buffer ){
            this.DOM = DOC.create( frame, "img", {
                className:"ImageView",
                src: "file://" + buffer.path
            });
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
