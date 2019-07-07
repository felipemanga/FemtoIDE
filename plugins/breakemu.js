APP.addPlugin("BreakEMU", [], _=> {
    let socket;

    APP.add({

        onDebugEmulatorStarted(port, isJLink){
            if( isJLink )
                return;

            if( socket )
                socket.end();

            setTimeout(_=>{
                let net = require("net");
                socket = net.connect(2000, "localhost");
                socket.on("close", _=>{
                    socket.end();
                    socket = null;
                });
            });
            
        },

        sendBreak(){
            if( !socket )
                return;
            socket.write("g;");
        }
        
    });

});
