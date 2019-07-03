nw.App.on('open', (...args)=>{
    console.log("Opening ", args);
    nw.Window.open('www/index.html');
});

nw.Window.open("www/splash.jpg", {
    width:690,
    height:350,
    position:"center",
    frame:false
}, splash =>{

    setTimeout(_=>{
        nw.Window.open('www/index.html');
        splash.close(true);
    }, 1000);

});
