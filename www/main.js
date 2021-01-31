let instances = [];

function boot(){
    if (!instances.length){
        nw.App.on('open', (args)=>{
            parseArgs(args);
        });
    }

    try{
        let width = (localStorage.getItem("width")|0) || 800;
        let height = (localStorage.getItem("height")|0) || 600;

        nw.Window.open('www/index.html', {min_width:400, min_height:300, width, height, frame:false}, win=>{
            let inst = {win, project:null};
            instances.push(inst);

            win.window.onOpenProject = project => {
                inst.project = project.split(require("path").sep).pop();
                win.window.APP.setStatus(`Opened project ${inst.project}.`);
            };

            win.on("close", _=>{
                instances.splice(instances.indexOf(inst), 1);
                width = win.width;
                height = win.height;
                localStorage.setItem("width", width);
                localStorage.setItem("height", height);

                win.close(true);
            });
        });
    }catch(ex){
        console.log(ex);
    }
}

function parseArgs(args){
    ARGS = args;
    let ignore = require('process').platform.toLowerCase() == "darwin";

    if(typeof args == "string")
        args = args.split(/("(?:[^\\"]*\\"|[^"])*")|\s+/);

    args = args.filter(x=>{
        if( ignore || !x ){
            ignore = false;
            return false;
        }
        x = x.trim();
        ignore = x.startsWith("--") && x.endsWith("=");
        return x.length && !x.startsWith("--");
    });

    args = args.map(a => {
	return a.replace(/^"(.*)"$/, "$1");
    });

    if( args.length > 1 ){
        let backup = [...args];

	let str = JSON.stringify(args);
	let inst;
	do {
            let project = args.shift();
	    inst = instances.find(inst=>inst.project == project);
	} while(args.length && !inst);

        if(inst){
            args.forEach(arg=>{
                inst.win.window.APP[arg]();
            });
        }else{
	    // instances[0].win.window.APP.log(str);
	    // boot();
            bootCMD(backup);
	};

    }else{
        boot();
    }
}

parseArgs(nw.App.argv);

function createConsole(){
    let process = require("process");
    let write = process.stdout.write.bind(process.stdout);

    // if(process.platform.toLowerCase() == "darwin")
    //     write = str => {
    //         fs.appendFileSync("/tmp/femtoide_log.txt", str);
    //     };

    let args = [];

    let console = {
        log(...args){
            for(let i of args)
                console.writeArg(i);
            write(args.join() + "\n");
            args = [];
        },

        error(...args){
            for(let i of args)
                console.writeArg(i);
            write(args.join() + "\n");
            args = [];
        },

        writeArg(arg){
            args.push(arg + "");
        }
    };
    return console;
}

function createDocument(){
    return {};
}
var module;
function bootCMD(args){
    let fs = require("fs");
    let window = global;
    window.path = require("path");
    window.console = createConsole();
    window.headless = true;

    try{
        let r = require;
        let B = Buffer;
        window.require = requireWrap;

        function requireWrap(...args){
            let c = window.Buffer;
            window.Buffer = B;
            window.require = r;
            let ret = r(...args);
            window.require = requireWrap;
            window.Buffer = c;
            return ret;
        };

        global.include = function(path){
            // console.log("Include " + path + "\n");
            module = {exports:{}};
            if(path[0] != '/' && path[0] != '.')
                path = "./www/" + path;
            (1,eval)(fs.readFileSync(path, "utf-8"));
            Object.assign(global, module.exports);
            // console.log(Object.keys(module.exports));
        };

        include("cmd.js");
        // console.log("ARGS: " + args.join(","));
        main(args);
    }catch(ex){

        let err = ex;
        if(ex && typeof ex.stack == "string")
            err = ex.stack;
        else if(ex && typeof ex.message == "string")
            err = ex.message;

        process.stdout.write(err + "\n");
    }
}

/*
nw.Window.open("www/splash.html", {
    width:485,//868,
    height:280,//374,
    position:"center",
    frame:false,
    transparent:true
}, splash =>{

    setTimeout(_=>{
        boot();
        splash.close(true);
    }, 4000);

});
*/
