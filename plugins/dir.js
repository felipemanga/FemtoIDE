APP.addPlugin("Directory", [], _ => {
    let preview;
    const nodefs = require("fs");
    
    class DirectoryView {
        constructor( frame, buffer ){
            this.el = DOC.create( frame, "ul", {
                className:"DirectoryView",
            });

            if( buffer.type == "IMG" ){
                nodefs.readFile(buffer.path, (err, data)=>{
                    if(err){
                        this.el.textContent = err;
                        return;
                    }
                    recurse("", this.el, APP.mountDisk(data.buffer));
                });
            } else {
                recurse(buffer.path, this.el, nodefs);
            }
        }
    }

    function recurse(p, parent, fs){
        fs.readdir( p, (err, files) => {
            if( err ) return;

            if( !files.length ){
                DOC.create("span", {text:"(Empty directory)"}, parent);
                return;
            }

            files.forEach( file => {
                if(file[0] == "." || file[file.length-1] == "~")
                    return;

                let fullpath = p + path.sep + file;
                fs.stat( fullpath, (err, stat)=>{
                    if(err) return;
                    let text = file;

                    if(!stat.isDirectory()){
                        let len = stat.size;
                        let unit = 'B';
                        if( len > 1024 ){
                            unit = 'KB';
                            len /= 1024;
                        }
                        if( len > 1024 ){
                            unit = 'MB';
                            len /= 1024;
                        }
                        len = (len*10|0)/10;
                        if(len != 1)
                            unit += "s";
                        text += " - " + len + unit;
                    }

                    let el = DOC.create(parent, "li", { text });
                    if(stat.isDirectory()){
                        recurse(fullpath, el, fs);
                    } else {
                        el.onclick = _=>{
                            if(fs == nodefs){
                                APP.findFile(fullpath, true);
                            }else{
                                let type = file
                                    .split(".")
                                    .pop()
                                    .toUpperCase();

                                let en = encoding[type] || "utf-8";

                                fs.readFile(fullpath,
                                            {encoding:en},
                                            (err, data)=>{
                                    if(!preview)
                                        preview = new Buffer();
                                    preview.name = file + "*PREVIEW*";
                                    preview.data = data;
                                    preview.type = type;
                                    APP.displayBuffer(preview);
                                });
                            }
                        };
                    }
                });
            });

        });
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( (buffer.type == "directory" || buffer.type == "IMG") && vf.priority < 2 ){
                vf.view = DirectoryView;
                vf.priority = 2;
            }
            
        }
        
    });

    return DirectoryView;
});
