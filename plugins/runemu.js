APP.addPlugin("RunEMU", [], _=> {
    const { execFile } = require('child_process');

    function replaceData( f ){
        return f.replace(/\$\{([^}]+)\}/g, (s, key)=>DATA[key]);
    }

    APP.add({

        runDebug(){
            this.run(["-g"]);
            APP.setStatus("Debugging " + DATA.buildFolder);
            if( DATA.debugBuffer )
                APP.displayBuffer( DATA.debugBuffer );                
        },

        run( flags ){

            let execPath = DATA[
                "EMU-" + DATA.project.target
            ] + DATA.executableExt;

            if( !execPath )
                return;

            flags = flags || [];

            let typeFlags = DATA.project["emuFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
            }

            flags = flags.map( f => replaceData(f) );

            console.log( execPath, ...flags );

            APP.setStatus("Emulating...");

            execFile( execPath, flags, (error, stdout, stderr)=>{
                if( stderr )
                    console.error( stderr );
                else
                    APP.setStatus("Emulation ended");

                if( stdout )
                    console.log( stdout );
            });
            
        }
    });
});
