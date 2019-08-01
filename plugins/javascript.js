APP.addPlugin("JS", ["Text"], TextView => {
    const extensions = ["JS"];

    function XML(src){
        return (new DOMParser()).parseFromString(src+"", "text/xml");
    }

    function read(file){
        return fs.readFileSync( DATA.projectPath + path.sep + file, "utf-8" );
    }

    function readImage(file){
        return new Promise((resolve, reject)=>{
            let img = new Image();
            fs.readFile(
                DATA.projectPath + path.sep + file,
                (error, data)=>{
                    if( error ){
                        reject(error);
                        return;
                    }

                    let url = URL.createObjectURL( new Blob([data], {type:"image/png"}));
                    img.src = url;
                    img.onload = _=>{
                        URL.revokeObjectURL(url);
                        let canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        let ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        resolve(ctx.getImageData( 0, 0, img.width, img.height ));
                    };

                    img.onerror = ex => {
                        URL.revokeObjectURL(url);
                        reject(ex);
                    };
                }
            );
        });
    }

    function write(file, str){
        fs.writeFileSync( DATA.projectPath + path.sep + file, str, "utf-8" );
    }

    const log = APP.log;

    function dir(folder){
        try{
            return fs.readdirSync( DATA.projectPath + path.sep + folder );
        }catch(ex){
            return null;
        }
    }

    function run(src){
        try {
            eval(src);
        } catch(ex){
            APP.error(ex);
        }
    }
    
    class JSView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/javascript");
        }

        doAction(){
            run(this.ace.session.getValue());
        }
    }

    APP.add(new class JavaScript {

        registerProjectFile( buffer ){
            if( !/\.js$/.test(buffer.name) )
                return;
            APP.readBuffer( buffer, undefined, (err, src)=>{
                if( err )
                    return;
                
                let match = src.match(/^\/\/!MENU-ENTRY:\s*([^\n]+)/);
                if( !match )
                    return;

                let binding = src.match(/\/\/!MENU-SHORTCUT:\s*([^\n]+)/);
                if( binding ){
                    APP.bindKeys("global", {[binding[1].trim()]:doAction});
                }
                
                APP.addMenu("Scripts", {[match[1]]:doAction});

                function doAction(){
                    APP.readBuffer( buffer, undefined, (err, src)=>{
                        if(!err)
                            eval(src);
                    });
                }
            });
        }
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = JSView;
                vf.priority = 1;
            }
            
        }
        
    });

    return JSView;
});
