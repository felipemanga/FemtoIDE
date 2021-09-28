APP.addPlugin("RunSIM", [], _=>{
    let running = false, restart = false;
    APP.add(new class RunSIM {
        isEmulatorRunning(){
            if (running) return true;
        }

        stopEmulator(){
            if( running )
                APP.killChild( running );
        }

        run( flags ){
            if(DATA.project.target != DATA.os)
                return;

            if( running ){
                restart = true;
                APP.stopEmulator();
                return;
            }

            let ldflags = APP.getFlags("LD");
            let execPath = ldflags[ldflags.indexOf("--output")+1];
            if( !execPath )
                return;

            flags = flags || [];
            flags = APP.replaceDataInString(flags);

            APP.setStatus("Executing...");
            let emu = APP.spawn( execPath, {cwd:DATA.projectPath}, ...flags );

            emu.stdout.on('data', data => {
                APP.log(data);
            });

            emu.stderr.on('data', data => {
                APP.error(data);
            });

            emu.on('close', code => {
                APP.onEmulatorStopped();
                APP.setStatus("Execution ended");
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
