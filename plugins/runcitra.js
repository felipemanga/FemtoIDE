APP.addPlugin("RunCitra", [], _=> {
    let running = false, restart = false;

    APP.add({

        isEmulatorRunning(){
            if(DATA.project.target != "3DS") return undefined;
            return !!running;
        },

        runDebug(){
            if(DATA.project.target != "3DS")
                return;

            this.run(["-g", "1235"]);
            APP.setStatus("Debugging " + DATA.buildFolder);
            if( DATA.debugBuffer )
                APP.displayBuffer( DATA.debugBuffer );
            setTimeout( _=>{
                if( running ){
                    APP.onDebugEmulatorStarted(1235);
                }
            }, 500);
        },

        stopEmulator(){
            if( running )
                APP.killChild( running );
        },

        run( flags ){
            if(DATA.project.target != "3DS")
                return;

            if( running ){
                restart = true;
                APP.stopEmulator();
                return;
            }

            flags = flags || [];

            let execPath = (DATA[
                "EMU-" + DATA.project.target
            ] || (flags[0] == '-g' ? "citra" : "citra-qt")) + DATA.executableExt;

            // execPath = 'citra-qt';
            // flags = [];

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
