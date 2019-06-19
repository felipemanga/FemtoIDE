APP.addPlugin("Image", [], _ => {
    const extensions = ["PNG", "JPG", "GIF"];

    Object.assign(encoding, {
        "PNG":null,
        "GIF":null,
        "JPG":null,
    });
    
    class ImageView {
        constructor( frame, buffer ){
            this.DOM = DOC.create( frame, "iframe", {
                className:"ImageView",
                src: "piskel/index.html?" + buffer.path
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
