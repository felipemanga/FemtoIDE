APP.addPlugin("Directory", [], _ => {
    
    class DirectoryView {
        constructor( frame, buffer ){
            this.el = DOC.create( frame, "ul", {
                className:"DirectoryView",
            });

            fs.readdir( buffer.path, (err, files) => {
                if( err ) return;

                if( !files.length ){
                    DOC.create("h1", {text:"Empty directory"}, this.el);
                    return;
                }

                files.forEach( file => {
                    fs.stat( buffer.path + path.sep + file, (err, stat)=>{
                        DOC.create(
                            this.el,
                            "li",
                            { text:file }
                        );
                    });
                });

            });
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( buffer.type == "directory" && vf.priority < 2 ){
                vf.view = DirectoryView;
                vf.priority = 2;
            }
            
        }
        
    });

    return DirectoryView;
});
