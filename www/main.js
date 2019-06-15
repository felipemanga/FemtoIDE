nw.App.on('open', (...args)=>{
    console.log("Opening ", args);
    nw.Window.open('www/index.html');
});

nw.Window.open('www/index.html');
