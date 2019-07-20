function boot(){
    try{
        let width = (localStorage.getItem("width")|0) || 800;
        let height = (localStorage.getItem("height")|0) || 600;
        
        nw.Window.open('www/index.html', {width, height}, win=>{
            win.on("close", _=>{
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

nw.App.on('open', (...args)=>{
    boot();
});

nw.Window.open("www/splash.html", {
    width:768,
    height:432,
    position:"center",
    frame:false
}, splash =>{

    setTimeout(_=>{
        boot();
        splash.close(true);
    }, 3000);

});
