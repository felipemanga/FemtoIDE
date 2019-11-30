let instances = [];

function boot(){
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

nw.App.on('open', (args)=>{
    let ignore = true;
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
    if( args.length ){
        let project = args.shift();
        let inst = instances.find(inst=>inst.project == project);
        if(inst){
            args.forEach(arg=>{
                inst.win.window.APP[arg]();
            });
        };
    }else{
        boot();
    }
});

nw.Window.open("www/splash.html", {
    width:756,
    height:336,
    position:"center",
    frame:false
}, splash =>{

    setTimeout(_=>{
        boot();
        splash.close(true);
    }, 3000);

});
