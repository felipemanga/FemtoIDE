
include("uwa.js");
include("pool.js");
include("doc.js");
include("index.js");

function main(args){
    const defListeners = {
        "compile":"onCompileComplete",
        "compileAndRun":"onEmulatorStopped",
        "run":"onEmulatorStopped"
    };

    // hack for exit not working
    nw.Window.open('', { show: false });

    APP.silence("onFileChanged");
    APP.silence("onKillBuffer");
    APP.silence("resetMenus");
    APP.silence("addMenu");

    let command = args[1];
    let listen = args[2] || defListeners[command];
    let cmdarg = [];
    if (listen == '-') {
        listen = defListeners[command];
        for (let i = 3; i < args.length; ++i) {
            let arg = args[i];
            if (arg == '-') {
                arg = args[i + 1] || defListeners[command];
                break;
            }
            cmdarg.push(arg);
        }
    }

    console.log("Open Project " + args[0] + " to " + command + " until " + listen);

    let onOpen = {
        onProjectReady(){
            APP.remove(onOpen);
            APP.add({
                error(ex){
                    setTimeout(_=>{
                        console.error(ex);
                        APP.exit(1);
                    }, 1000);
                },

                [listen](){
                    APP.exit();
                }
            });
            APP[command](...cmdarg);
        // },

        // registerProjectFile(buffer){
        //     console.log("Register " + buffer.path);
        }
    };

    let onLoad = {
        onPluginsLoaded(){
            APP.remove(onLoad);
            APP.add(onOpen);
            APP.openProject(DATA.projectsPath + path.sep + args[0]);
        }
    };

    APP.add(onLoad);
}
