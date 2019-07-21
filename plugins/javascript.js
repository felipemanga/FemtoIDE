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
            img.src = "file://" + DATA.projectPath + path.sep + file + "?" + Math.random();
            img.onload = _=>{
                let canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData( 0, 0, img.width, img.height ));
            };

            img.onerror = ex => reject(ex);
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
    
    class JSView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/javascript");
        }

        doAction(){
            try{
                eval(this.ace.session.getValue());
            }catch(ex){
                APP.error(ex);
            }
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = JSView;
                vf.priority = 1;
            }
            
        }
        
    });

    return JSView;
});
