APP.addPlugin("RunEMU", [], _=> {
    let running = false, restart = false;

    APP.add({
        isEmulatorRunning(){
            if (running) return true;
        },

        runDebug(){
            if(DATA.project.target != "Pokitto")
                return;

            this.run(["-g", "-x"]);
            APP.setStatus("Debugging " + DATA.buildFolder);
            if( DATA.debugBuffer )
                APP.displayBuffer( DATA.debugBuffer );
            setTimeout( _=>{
                if( running ){
                    APP.onDebugEmulatorStarted(1234);
                }
            }, 500);
        },

        stopEmulator(){
            if( running )
                APP.killChild( running );
        },

        run( flags ){
            if(DATA.project.target != "Pokitto")
                return;

            if( running ){
                restart = true;
                APP.stopEmulator();
                return;
            }

            let execPath = DATA[
                "EMU-" + DATA.project.target
            ] + DATA.executableExt;

            if( !execPath )
                return;

            flags = flags || [];

            flags.push(...APP.getFlags("emu"));

            APP.pollEmulatorFlags(flags);

            flags = APP.replaceDataInString(flags);

            APP.setStatus("Emulating...");
            let emu = APP.spawn( execPath, ...flags );

            emu.stdout.on('data', data => {
                APP.log(data);
            });

            emu.stderr.on('data', data => {
                APP.error(data);
            });

            emu.on('close', code => {
                APP.onEmulatorStopped();
                APP.setStatus("Emulation ended");
                running = false;
                if(restart){
                    restart = false;
                    APP.run();
                }
            });

            running = emu;

        }
    });
});
