APP.addPlugin("JS", (window.headless ? [] : ["Text"]), TextView => {
    const extensions = ["JS"];

    function XML(src){
        return (new DOMParser()).parseFromString(src+"", "text/xml");
    }

    function read(file){
        return fs.readFileSync( DATA.projectPath + path.sep + file, "utf-8" );
    }

    function readImage(file, opt={}){
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
                        opt.width = opt.width || img.width;
                        opt.height = opt.height || img.height;
                        let w = opt.width, h = opt.height;

                        canvas.width = opt.width;
                        canvas.height = opt.height;
                        let ctx = canvas.getContext("2d");

                        if(opt.fit){
                            let scale = Math.min(
                                w / img.width,
                                h / img.height
                            );
                            w = img.width * scale;
                            h = img.height * scale;
                        }

                        ctx.drawImage(
                            img,
                            canvas.width/2 - w/2,
                            canvas.height/2 - h/2,
                            w, h);

                        let data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
                        data.image = img;
                        resolve(data);
                    };

                    img.onerror = ex => {
                        URL.revokeObjectURL(url);
                        reject(ex);
                    };
                }
            );
        });
    }

    function fileExists(file){
        return fs.existsSync( DATA.projectPath + path.sep + file );
    }

    function copyFile(src, dest){
        if( !path.isAbsolute(src) )
            src = path.join(DATA.projectPath, src);
        if( !path.isAbsolute(dest) )
            dest = path.join(DATA.projectPath, dest);

        if( dest.startsWith(DATA.projectPath) ){
            let buffer = APP.findFile(dest);
            buffer.data = fs.readFileSync(src);
            APP.writeBuffer(buffer);
        }else{
            fs.copyFileSync(src, dest);
        }
    }

    function write(file, str, format = "utf-8"){
        let filePath = DATA.projectPath + path.sep + file;
        let buffer = APP.findFile(filePath);
        buffer.data = str;
        buffer.transform = null;
        APP.writeBuffer(buffer);
    }

    const log = APP.log;

    function dir(folder){
        try{
            return fs.readdirSync( DATA.projectPath + path.sep + folder );
        }catch(ex){
            return null;
        }
    }

    function stat(name){
        try{
            return fs.statSync( DATA.projectPath + path.sep + name );
        }catch(ex){
            return null;
        }
    }

    function invoke(cmd, ...args){
        let data = '';
        return new Promise((ok, notok)=>{
            APP.spawn(cmd, {cwd:DATA.projectPath}, args)
                .on('data-out', d => data += d)
                .on('data-err', d => data += d)
                .on('close', error=> error ? notok({data, error}) : ok(data))
                .on('error', error=> notok({error}));
        });
    }

    function run(src, hookTrigger, hookArgs){
        eval(src);
    }

    function processScript(src, buffer){
        src.replace(/\/\/!APP-HOOK:\s*([^\n]+)/g, (str, hook)=>{
            hook = hook.trim();
            console.log("Found script " + buffer.name + " hooking " + hook);
            APP.add({[hook]:doAction.bind(null, hook)});
        });

        let match = src.match(/\/\/!MENU-ENTRY:\s*([^\n]+)/);
        if( !match )
            return;

        let binding = src.match(/\/\/!MENU-SHORTCUT:\s*([^\n]+)/);
        if( binding ){
            APP.bindKeys("global", {[binding[1].trim()]:doAction.bind(null, "menu")});
        }

        APP.addMenu("Scripts", {[match[1]]:doAction.bind(null, "menu")});

        function doAction(hookTrigger, ...hookArgs){
            let src = APP.readBufferSync( buffer );
            run(src, hookTrigger, hookArgs);
        }
    }

    APP.add(new class JavaScript {

        registerProjectFile( buffer ){
            if( !/\.js$/.test(buffer.name) )
                return;
            if(window.headless){
                processScript( APP.readBufferSync(buffer), buffer );
            } else {
                APP.readBuffer( buffer, undefined, (err, src)=>{
                    if(!err)
                        processScript(src, buffer);
                });
            }
        }
        
        pollViewForBuffer( buffer, vf ){
            if(window.headless)
                return;

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.priority = 1;
                vf.view = class JSView extends TextView {
                    constructor( frame, buffer ){
                        super(frame, buffer);
                        this.ace.session.setMode("ace/mode/javascript");
                    }

                    doAction(){
                        run(this.ace.session.getValue(), "manual", []);
                    }
                };
            }
        }
    });

    if(typeof JSView === "undefined")
        return {};

    return JSView;
});
