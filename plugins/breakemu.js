APP.addPlugin("BreakEMU", [], _=> {
    let socket;

    function close(){
	if( !socket ) return;
	try{
	    socket.end();
	}catch(ex){}
        socket = null;	
    }

    APP.add({

        onDebugEmulatorStarted(port, isJLink){
            if( isJLink )
                return;

            if( socket )
                close();

            setTimeout(_=>{
                let net = require("net");
                socket = net.connect(2000, "localhost");
                socket.on("close", _=>{
                    close();
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
